import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { list, put } from "@vercel/blob"

type ArticleVideoRecord = {
  slug: string
  format: string
  youtubeUrl: string
  videoId: string
  publishedAt: string
}

type VideoStats = {
  viewCount: number
  likeCount: number
  commentCount: number
}

type VideoMetric = ArticleVideoRecord & { stats: VideoStats | null }

type MetricsCache = {
  videos: VideoMetric[]
  totals: { videos: number; shorts: number; longs: number; views: number; likes: number; comments: number }
  lastUpdated: string
}

const EMPTY = { videos: [], totals: { videos: 0, shorts: 0, longs: 0, views: 0, likes: 0, comments: 0 }, lastUpdated: null }

async function readCache(): Promise<MetricsCache | null> {
  try {
    const { blobs } = await list({ prefix: "youtube/metrics-cache.json" })
    if (blobs.length === 0) return null
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    return await res.json()
  } catch {
    return null
  }
}

async function writeCache(data: MetricsCache) {
  await put("youtube/metrics-cache.json", JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

export async function GET(req: NextRequest) {
  const token = await verifyAdmin(req)
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 1. Read all published videos from Blob
    const { blobs } = await list({ prefix: "youtube/article-videos.json" })
    if (blobs.length === 0) return NextResponse.json(EMPTY)

    const res = await fetch(blobs[0].url, { cache: "no-store" })
    const records: ArticleVideoRecord[] = await res.json().catch(() => [])
    if (records.length === 0) return NextResponse.json(EMPTY)

    // 2. Try live fetch via OAuth
    const videoIds = records.map((r) => r.videoId).filter(Boolean)
    const statsMap: Record<string, VideoStats> = {}
    let liveFetched = false

    if (videoIds.length > 0 && token.accessToken) {
      try {
        const ids = videoIds.join(",")
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}`,
          { headers: { Authorization: `Bearer ${token.accessToken}` }, cache: "no-store" },
        )
        if (ytRes.ok) {
          const ytData = await ytRes.json()
          for (const item of ytData.items ?? []) {
            const s = item.statistics
            statsMap[item.id] = {
              viewCount: parseInt(s.viewCount || "0", 10),
              likeCount: parseInt(s.likeCount || "0", 10),
              commentCount: parseInt(s.commentCount || "0", 10),
            }
          }
          liveFetched = true
        }
      } catch {
        // Fall through to cache
      }
    }

    if (liveFetched) {
      const videos: VideoMetric[] = records
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .map((r) => ({ ...r, stats: statsMap[r.videoId] ?? null }))

      const totals = {
        videos: videos.length,
        shorts: videos.filter((v) => v.format === "short").length,
        longs: videos.filter((v) => v.format === "long").length,
        views: videos.reduce((sum, v) => sum + (v.stats?.viewCount ?? 0), 0),
        likes: videos.reduce((sum, v) => sum + (v.stats?.likeCount ?? 0), 0),
        comments: videos.reduce((sum, v) => sum + (v.stats?.commentCount ?? 0), 0),
      }

      const lastUpdated = new Date().toISOString()
      writeCache({ videos, totals, lastUpdated }).catch(() => {})

      return NextResponse.json({ videos, totals, lastUpdated })
    }

    // 3. Fall back to cache
    const cached = await readCache()
    if (cached) return NextResponse.json(cached)

    // 4. No cache, no live — return records without stats
    const videos: VideoMetric[] = records
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map((r) => ({ ...r, stats: null }))

    const totals = {
      videos: videos.length,
      shorts: videos.filter((v) => v.format === "short").length,
      longs: videos.filter((v) => v.format === "long").length,
      views: 0, likes: 0, comments: 0,
    }

    return NextResponse.json({ videos, totals, lastUpdated: null })
  } catch {
    const cached = await readCache()
    if (cached) return NextResponse.json(cached)
    return NextResponse.json(EMPTY)
  }
}
