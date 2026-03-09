import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "youtube/playlist-id.json" })
    if (blobs.length === 0) return NextResponse.json({ playlistId: null })
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    const data = await res.json()
    return NextResponse.json({ playlistId: data.playlistId ?? null })
  } catch {
    return NextResponse.json({ playlistId: null })
  }
}
