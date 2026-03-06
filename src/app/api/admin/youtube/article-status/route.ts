import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { list } from "@vercel/blob"

type ArticleVideoRecord = {
  slug: string
  format: string
  youtubeUrl: string
  videoId: string
  publishedAt: string
}

export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  try {
    const { blobs } = await list({ prefix: "youtube/article-videos.json" })
    if (blobs.length === 0) return NextResponse.json({ short: null, long: null })

    const res = await fetch(blobs[0].url, { cache: "no-store" })
    const records: ArticleVideoRecord[] = await res.json().catch(() => [])

    const forSlug = records.filter((r) => r.slug === slug)
    const find = (fmt: string) => forSlug.find((r) => r.format === fmt) ?? null

    const short = find("short")
    const long = find("long")

    return NextResponse.json({
      short: short ? { youtubeUrl: short.youtubeUrl, publishedAt: short.publishedAt } : null,
      long: long ? { youtubeUrl: long.youtubeUrl, publishedAt: long.publishedAt } : null,
    })
  } catch {
    return NextResponse.json({ short: null, long: null })
  }
}
