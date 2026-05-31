import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { list } from "@vercel/blob"

export async function GET(req: NextRequest) {
  const token = await verifyAdmin(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [subBlob, sentBlob] = await Promise.allSettled([
      list({ prefix: "newsletter/subscribers.json" }),
      list({ prefix: "newsletter/sent-posts.json" }),
    ])

    let subscriberCount = 0
    let sentSlugs: string[] = []

    if (subBlob.status === "fulfilled" && subBlob.value.blobs.length > 0) {
      const res = await fetch(subBlob.value.blobs[0].url)
      const data = await res.json()
      const subscribers = Array.isArray(data) ? data : (data.subscribers ?? [])
      subscriberCount = subscribers.filter((s: { confirmed?: boolean }) => s.confirmed !== false).length
    }

    if (sentBlob.status === "fulfilled" && sentBlob.value.blobs.length > 0) {
      const res = await fetch(sentBlob.value.blobs[0].url)
      const data = await res.json()
      sentSlugs = Array.isArray(data) ? data : (data.slugs ?? data.posts ?? [])
    }

    return NextResponse.json({ subscriberCount, sentSlugs })
  } catch {
    return NextResponse.json({ subscriberCount: 0, sentSlugs: [] })
  }
}
