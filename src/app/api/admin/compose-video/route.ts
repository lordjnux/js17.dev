import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, ADMIN_EMAIL } from "@/lib/auth"

interface SlideInput {
  title: string
  bullets: string[]
  estimatedDuration: number
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slides, audioUrl, totalDuration, videoFormat = "long" } = await req.json()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev"
  const isShort = videoFormat === "short"

  // Build slide clips — each slide encoded as base64 data URL param
  let currentTime = 0
  const slideClips = slides.map((slide: SlideInput, i: number) => {
    const data = Buffer.from(
      JSON.stringify({
        title: slide.title,
        bullets: slide.bullets,
        slideNum: i + 1,
        total: slides.length,
        format: videoFormat,
      })
    ).toString("base64")

    const clip = {
      asset: {
        type: "image",
        src: `${siteUrl}/api/slides/render?data=${encodeURIComponent(data)}`,
      },
      start: currentTime,
      length: slide.estimatedDuration,
      effect: i === 0 ? "zoomIn" : "fadeIn",
      transition: { in: "fade", out: "fade" },
    }
    currentTime += slide.estimatedDuration
    return clip
  })

  const timeline = {
    background: "#080d1a",
    tracks: [
      { clips: slideClips },
      {
        clips: [
          {
            asset: { type: "audio", src: audioUrl, volume: 1 },
            start: 0,
            length: totalDuration,
          },
        ],
      },
    ],
  }

  const output = isShort
    ? { format: "mp4", size: { width: 1080, height: 1920 }, fps: 30, quality: "high" }
    : { format: "mp4", resolution: "hd", fps: 25, quality: "high" }

  const res = await fetch("https://api.shotstack.io/v1/render", {
    method: "POST",
    headers: {
      "x-api-key": process.env.SHOTSTACK_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ timeline, output }),
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: data.message || "Shotstack error" }, { status: 500 })
  }

  const jobId = data?.response?.id
  if (!jobId) {
    return NextResponse.json({ error: "No job ID in Shotstack response" }, { status: 500 })
  }

  return NextResponse.json({ jobId })
}
