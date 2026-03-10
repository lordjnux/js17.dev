import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { getAllPosts } from "@/lib/mdx"
import { syncAllPosts, getAllMetadata } from "@/lib/blog-metadata"

/**
 * POST /api/admin/sync-blog-metadata
 * Syncs all published MDX posts into MongoDB.
 * Admin-only — requires valid session cookie.
 *
 * CLI usage:
 *   curl -X POST https://js17.dev/api/admin/sync-blog-metadata \
 *     -H "Cookie: next-auth.session-token=<token>"
 */
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
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

/**
 * GET /api/admin/sync-blog-metadata
 * Returns all stored metadata records.
 * Admin-only.
 *
 * CLI usage:
 *   curl https://js17.dev/api/admin/sync-blog-metadata \
 *     -H "Cookie: next-auth.session-token=<token>"
 */
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MONGODB_URI not configured" }, { status: 500 })
  }

  try {
    const records = await getAllMetadata()
    return NextResponse.json({ records, count: records.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
