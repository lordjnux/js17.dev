import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, ADMIN_EMAIL } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accessToken = session.accessToken
  if (!accessToken) {
    return NextResponse.json({ error: "No YouTube access token. Please sign out and sign in again." }, { status: 401 })
  }

  const { videoUrl, title, description, tags, playlistId } = await req.json()
  if (!videoUrl || !title) {
    return NextResponse.json({ error: "Missing videoUrl or title" }, { status: 400 })
  }

  // Download the rendered video from Shotstack server-side
  const videoRes = await fetch(videoUrl)
  if (!videoRes.ok) {
    return NextResponse.json({ error: "Failed to download rendered video" }, { status: 502 })
  }

  const videoBuffer = await videoRes.arrayBuffer()
  const videoSize = videoBuffer.byteLength

  // Step 1: Initiate resumable upload session
  const initRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": "video/mp4",
        "X-Upload-Content-Length": String(videoSize),
      },
      body: JSON.stringify({
        snippet: {
          title,
          description: description || "",
          tags: tags || [],
          categoryId: "28", // Science & Technology
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
        },
      }),
    }
  )

  if (!initRes.ok) {
    const err = await initRes.json().catch(() => ({}))
    return NextResponse.json(
      { error: err?.error?.message || "Failed to initiate YouTube upload" },
      { status: initRes.status }
    )
  }

  const uploadUrl = initRes.headers.get("Location")
  if (!uploadUrl) {
    return NextResponse.json({ error: "No upload URL returned by YouTube" }, { status: 500 })
  }

  // Step 2: Upload video bytes
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(videoSize),
    },
    body: videoBuffer,
  })

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}))
    return NextResponse.json(
      { error: err?.error?.message || "YouTube upload failed" },
      { status: uploadRes.status }
    )
  }

  const videoData = await uploadRes.json()
  const ytId = videoData.id
  if (!ytId) {
    return NextResponse.json({ error: "No video ID in YouTube response" }, { status: 500 })
  }

  // Add to playlist if provided (non-blocking — don't fail the upload if this fails)
  if (playlistId) {
    await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          playlistId,
          resourceId: { kind: "youtube#video", videoId: ytId },
        },
      }),
    }).catch(() => {})
  }

  return NextResponse.json({
    youtubeUrl: `https://youtube.com/watch?v=${ytId}`,
    videoId: ytId,
  })
}
