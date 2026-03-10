import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { getPostBySlug } from "@/lib/mdx"
import { fetchRelevantImages, deriveImageQuery } from "@/lib/stock-images"

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug, videoFormat = "long" } = await req.json()
  const post = getPostBySlug(slug)
  if (!post) return NextResponse.json({ images: [] })

  const orientation = videoFormat === "short" ? "portrait" : "landscape"
  const query = deriveImageQuery(
    post.frontmatter.title,
    (post.frontmatter.tags as string[] | undefined) || []
  )

  const results = await fetchRelevantImages(query, 2, orientation)
  const images = results.map(r => r.url)

  return NextResponse.json({ images })
}
