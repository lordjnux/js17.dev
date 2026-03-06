import { NextRequest, NextResponse } from "next/server"
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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = (process.env.YOUTUBE_API_KEY || "").trim()
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY not configured" }, { status: 500 })
  }

  try {
    const { blobs } = await list({ prefix: "youtube/article-videos.json" })
    if (blobs.length === 0) {
      return NextResponse.json({ message: "No videos to refresh" })
    }

    const res = await fetch(blobs[0].url, { cache: "no-store" })
    const records: ArticleVideoRecord[] = await res.json().catch(() => [])
    if (records.length === 0) {
      return NextResponse.json({ message: "No video records found" })
    }

    const videoIds = records.map((r) => r.videoId).filter(Boolean)
    const statsMap: Record<string, VideoStats> = {}

    if (videoIds.length > 0) {
      const ids = videoIds.join(",")
      const ytRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${apiKey}`,
        { cache: "no-store" },
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
      }
    }

    const videos = records
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

    await put("youtube/metrics-cache.json", JSON.stringify({ videos, totals, lastUpdated }), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    return NextResponse.json({ message: "Metrics refreshed", totals, lastUpdated })
  } catch {
    return NextResponse.json({ error: "Failed to refresh metrics" }, { status: 500 })
  }
}
