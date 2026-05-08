import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

type VideoStats = { viewCount: number; likeCount: number; commentCount: number }
type VideoMetric = {
  slug: string
  format: string
  youtubeUrl: string
  videoId: string
  publishedAt: string
  stats: VideoStats | null
}
type MetricsCache = {
  videos: VideoMetric[]
  totals: { videos: number; shorts: number; longs: number; views: number; likes: number; comments: number }
  lastUpdated: string | null
}

const EMPTY: MetricsCache = {
  videos: [],
  totals: { videos: 0, shorts: 0, longs: 0, views: 0, likes: 0, comments: 0 },
  lastUpdated: null,
}

export async function GET() {
  try {
    // 1. Try the populated metrics cache first (has real stats)
    const { blobs: cacheBlobs } = await list({ prefix: "youtube/metrics-cache.json" })
    if (cacheBlobs.length > 0) {
      const res = await fetch(cacheBlobs[0].url, { cache: "no-store" })
      const data: MetricsCache = await res.json()
      if (data.videos && data.videos.length > 0) return NextResponse.json(data)
    }

    // 2. Fall back to article-videos.json — shows video counts even without stats
    const { blobs: recordBlobs } = await list({ prefix: "youtube/article-videos.json" })
    if (recordBlobs.length === 0) return NextResponse.json(EMPTY)

    const res = await fetch(recordBlobs[0].url, { cache: "no-store" })
    const records: Omit<VideoMetric, "stats">[] = await res.json().catch(() => [])
    if (records.length === 0) return NextResponse.json(EMPTY)

    const videos: VideoMetric[] = records
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map((r) => ({ ...r, stats: null }))

    const totals = {
      videos: videos.length,
      shorts: videos.filter((v) => v.format === "short").length,
      longs: videos.filter((v) => v.format === "long").length,
      views: 0,
      likes: 0,
      comments: 0,
    }

    return NextResponse.json({ videos, totals, lastUpdated: null })
  } catch {
    return NextResponse.json(EMPTY)
  }
}
