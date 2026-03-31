import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

export const revalidate = 3600

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "newsletter/subscribers.json" })
    if (blobs.length === 0) return NextResponse.json({ count: 0 })
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    const data = await res.json()
    const count = Array.isArray(data) ? data.length : 0
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
