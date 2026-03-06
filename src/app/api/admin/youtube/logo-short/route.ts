import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { put } from "@vercel/blob"
import OpenAI from "openai"

// Vertical 1080×1920 YouTube Short — ~55s brand story

const NARRATION = `You might be wondering — what does js17.dev actually mean? Let me break it down.

The js stands for Jeroham Sanchez — my initials. But it's also a tribute to JavaScript and the fullstack ecosystem it represents. Everything from frontend to cloud.

Seventeen is extraordinary. It appears in mathematics, philosophy, religion, and the arts. A number that surfaces across many dimensions of life as a constant marker of depth.

And dot dev? That's the commitment — the highest level of programming craft, pushing AI to its absolute potential. Command center thinking. Expansion. Minimalism. Calm. Effective. Aware. That's js17.dev.`

const SLIDES = [
  {
    title: "What Does\njs17.dev Mean?",
    bullets: ["A name isn't just letters.", "It's a statement."],
    estimatedDuration: 13,
  },
  {
    title: "js —\nIdentity & Craft",
    bullets: ["Jeroham Sanchez — my initials", "A tribute to JavaScript", "The full stack, browser to cloud"],
    estimatedDuration: 14,
  },
  {
    title: "17 —\nThe Special Number",
    bullets: ["Mathematics, philosophy, the arts", "Religion, esoterics, and science", "A marker of depth across domains"],
    estimatedDuration: 14,
  },
  {
    title: ".dev —\nThe Commitment",
    bullets: ["Highest level of programming craft", "AI pushed to its extreme", "Command. Expansion. Awareness."],
    estimatedDuration: 14,
  },
]

const TOTAL_DURATION = SLIDES.reduce((sum, s) => sum + s.estimatedDuration, 0) // 55s

function buildSlideHtml(title: string, bullets: string[]): string {
  const bulletItems = bullets
    .map((b) => `<li>${b.replace(/\n/g, "<br>")}</li>`)
    .join("")

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;background:linear-gradient(180deg,#060b14 0%,#0d1526 60%,#060b14 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:90px 80px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative}.accent{font-size:22px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#2563eb;margin-bottom:56px;font-family:'Courier New',monospace}.title{font-size:82px;font-weight:800;color:#f8fafc;line-height:1.08;text-align:center;margin-bottom:56px;letter-spacing:-2px;white-space:pre-line}.divider{width:64px;height:3px;background:#2563eb;border-radius:2px;margin-bottom:48px}.bullets{list-style:none;text-align:center;width:100%}.bullets li{font-size:34px;color:#94a3b8;margin-bottom:18px;line-height:1.45}.brand{position:absolute;bottom:80px;font-size:26px;font-family:'Courier New',monospace;font-weight:700;color:#2563eb;letter-spacing:-0.5px}</style></head><body><div class="accent">js17.dev</div><h1 class="title">${title.replace(/\n/g, "<br>")}</h1><div class="divider"></div><ul class="bullets">${bulletItems}</ul><div class="brand">js17.dev</div></body></html>`
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 })
  }
  if (!process.env.SHOTSTACK_API_KEY) {
    return NextResponse.json({ error: "SHOTSTACK_API_KEY not configured" }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev"

  // Step 1: Generate TTS audio
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const audioStream = await openai.audio.speech.create({
    model: "tts-1",
    voice: "onyx",
    input: NARRATION,
    speed: 0.95,
  })
  const audioBuffer = Buffer.from(await audioStream.arrayBuffer())
  const { url: audioUrl } = await put(`audio/logo-short-${Date.now()}.mp3`, audioBuffer, {
    access: "public",
    contentType: "audio/mpeg",
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  // Step 2: Build Shotstack payload with HTML assets (vertical 1080×1920)
  let currentTime = 0
  const slideClips = SLIDES.map((slide, i) => {
    const html = buildSlideHtml(slide.title, slide.bullets)
    const clip = {
      asset: {
        type: "html",
        html,
        width: 1080,
        height: 1920,
        background: "transparent",
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
    background: "#060b14",
    tracks: [
      { clips: slideClips },
      {
        clips: [
          {
            asset: { type: "audio", src: audioUrl, volume: 1 },
            start: 0,
            length: TOTAL_DURATION,
          },
        ],
      },
    ],
  }

  const output = {
    format: "mp4",
    size: { width: 1080, height: 1920 },
    fps: 30,
    quality: "high",
  }

  const shotstackEnv = process.env.SHOTSTACK_ENV || "stage"
  const shotRes = await fetch(`https://api.shotstack.io/${shotstackEnv}/render`, {
    method: "POST",
    headers: {
      "x-api-key": (process.env.SHOTSTACK_API_KEY || "").trim(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ timeline, output }),
  })

  const shotData = await shotRes.json()
  if (!shotRes.ok) {
    const detail = shotData?.errors?.[0]?.detail || shotData.message || shotData.error || JSON.stringify(shotData)
    return NextResponse.json({ error: `Shotstack ${shotstackEnv}: ${detail}` }, { status: 500 })
  }

  const jobId = shotData?.response?.id
  if (!jobId) {
    return NextResponse.json({ error: "No job ID in Shotstack response" }, { status: 500 })
  }

  return NextResponse.json({
    jobId,
    audioUrl,
    totalDuration: TOTAL_DURATION,
    youtubeTitle: "What Does js17.dev Mean? #Shorts",
    youtubeTags: ["js17dev", "JavaScript", "AIEngineering", "Fullstack", "WebDevelopment", "Shorts", "Developer", "Branding", "TechShorts", "Programming"],
    siteUrl,
  })
}
