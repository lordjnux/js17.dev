import { NextRequest, NextResponse } from "next/server"
import { getAllPosts } from "@/lib/mdx"
import { syncAllPosts } from "@/lib/blog-metadata"

/**
 * GET /api/cron/sync-blog-metadata
 * Scheduled daily at 07:00 UTC — keeps MongoDB metadata in sync with MDX content.
 * Protected by CRON_SECRET (set automatically by Vercel for cron jobs).
 *
 * CLI usage (manual trigger):
 *   curl https://js17.dev/api/cron/sync-blog-metadata \
 *     -H "Authorization: Bearer <CRON_SECRET>"
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MONGODB_URI not configured" }, { status: 500 })
  }

  try {
    const posts = getAllPosts()
    const result = await syncAllPosts(posts)

    return NextResponse.json({
      ok: true,
      syncedAt: new Date().toISOString(),
      ...result,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
