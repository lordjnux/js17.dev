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
  lastUpdated: string
}

const EMPTY = {
  videos: [],
  totals: { videos: 0, shorts: 0, longs: 0, views: 0, likes: 0, comments: 0 },
  lastUpdated: null,
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "youtube/metrics-cache.json" })
    if (blobs.length === 0) return NextResponse.json(EMPTY)
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    const data: MetricsCache = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(EMPTY)
  }
}
