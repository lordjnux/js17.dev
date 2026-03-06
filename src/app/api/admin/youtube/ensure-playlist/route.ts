import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { put, list } from "@vercel/blob"

const PLAYLIST_BLOB = "youtube/playlist-id.json"
const PLAYLIST_TITLE = "js17.dev"
const PLAYLIST_DESCRIPTION =
  "Tech engineering articles and brand content from js17.dev — AI-augmented fullstack development, architecture, and systems engineering."

export async function POST(req: NextRequest) {
  const token = await verifyAdmin(req)
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accessToken = token.accessToken as string | undefined
  if (!accessToken) {
    return NextResponse.json({ error: "No YouTube access token. Please sign out and sign in again." }, { status: 401 })
  }

  // Check Blob cache first
  try {
    const { blobs } = await list({ prefix: PLAYLIST_BLOB })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      const cached = await res.json().catch(() => null)
      if (cached?.playlistId) {
        return NextResponse.json({ playlistId: cached.playlistId, cached: true })
      }
    }
  } catch {
    // fall through to fresh lookup
  }

  // List existing playlists on the channel
  const listRes = await fetch(
    "https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!listRes.ok) {
    const err = await listRes.json().catch(() => ({}))
    return NextResponse.json(
      { error: err?.error?.message || "Failed to list YouTube playlists" },
      { status: listRes.status }
    )
  }

  const listData = await listRes.json()
  interface PlaylistItem { id: string; snippet?: { title?: string } }
  const existing = (listData.items as PlaylistItem[] | undefined)?.find(
    (p) => p.snippet?.title === PLAYLIST_TITLE
  )

  let playlistId: string

  if (existing) {
    playlistId = existing.id
  } else {
    // Create new playlist
    const createRes = await fetch(
      "https://www.googleapis.com/youtube/v3/playlists?part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            title: PLAYLIST_TITLE,
            description: PLAYLIST_DESCRIPTION,
            defaultLanguage: "en",
          },
          status: { privacyStatus: "public" },
        }),
      }
    )

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: err?.error?.message || "Failed to create YouTube playlist" },
        { status: createRes.status }
      )
    }

    const createData = await createRes.json()
    playlistId = createData.id
  }

  // Cache in Blob
  await put(PLAYLIST_BLOB, JSON.stringify({ playlistId }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  }).catch(() => {})

  return NextResponse.json({ playlistId, cached: false, created: !existing })
}
