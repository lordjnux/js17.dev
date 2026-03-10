import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { put, list } from "@vercel/blob"

export const maxDuration = 60

export async function DELETE(req: NextRequest) {
  const token = await verifyAdmin(req)
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accessToken = token.accessToken as string | undefined
  if (!accessToken) {
    return NextResponse.json({ error: "No YouTube access token" }, { status: 401 })
  }

  const { videoIds } = await req.json()
  if (!videoIds || !Array.isArray(videoIds)) {
    return NextResponse.json({ error: "Missing videoIds array" }, { status: 400 })
  }

  const results: { videoId: string; deleted: boolean; error?: string }[] = []
  for (const videoId of videoIds) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.ok || res.status === 204) {
      results.push({ videoId, deleted: true })
    } else {
      const err = await res.json().catch(() => ({}))
      results.push({ videoId, deleted: false, error: err?.error?.message || `HTTP ${res.status}` })
    }
  }

  // Clean up blob tracking
  try {
    const BLOB = "youtube/article-videos.json"
    const { blobs } = await list({ prefix: BLOB })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      type ArticleVideoRecord = { slug: string; format: string; youtubeUrl: string; videoId: string; publishedAt: string }
      let records: ArticleVideoRecord[] = await res.json().catch(() => [])
      const deletedIds = new Set(videoIds)
      records = records.filter((r) => !deletedIds.has(r.videoId))
      await put(BLOB, JSON.stringify(records), { access: "public", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true })
    }
  } catch { /* non-blocking */ }

  return NextResponse.json({ results })
}

export async function POST(req: NextRequest) {
  const token = await verifyAdmin(req)
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accessToken = token.accessToken as string | undefined
  if (!accessToken) {
    return NextResponse.json({ error: "No YouTube access token. Please sign out and sign in again." }, { status: 401 })
  }

  const { videoUrl, title, description, tags, playlistId, slug, videoFormat } = await req.json()
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

  // Track published article videos to prevent double-publish
  if (slug && videoFormat) {
    try {
      const BLOB = "youtube/article-videos.json"
      const { blobs } = await list({ prefix: BLOB })
      type ArticleVideoRecord = { slug: string; format: string; youtubeUrl: string; videoId: string; publishedAt: string }
      let records: ArticleVideoRecord[] = []
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: "no-store" })
        records = await res.json().catch(() => [])
      }
      records.push({ slug, format: videoFormat, youtubeUrl: `https://youtube.com/watch?v=${ytId}`, videoId: ytId, publishedAt: new Date().toISOString() })
      await put(BLOB, JSON.stringify(records), { access: "public", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true })
    } catch {
      // Non-blocking — don't fail the upload response
    }
  }

  return NextResponse.json({
    youtubeUrl: `https://youtube.com/watch?v=${ytId}`,
    videoId: ytId,
  })
}
