import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { put } from "@vercel/blob"
import OpenAI from "openai"

// Horizontal 1280×720 brand video — 62–96s (target ~75s)

const NARRATION = `Every serious brand carries meaning. js17.dev is no different. Three elements — two letters, two digits, four letters. Each one chosen with intention.

The js stands for Jeroham Sanchez — my initials. But it's also a deliberate tribute to JavaScript, the language that runs the modern web. From React to Node.js, from APIs to edge functions, JavaScript and its ecosystem are the foundation of everything I build.

Seventeen appears in unexpected places. In number theory, it's a prime. In the Tarot, it's The Star — hope and inspiration. Across mathematics, philosophy, religion, and the arts, seventeen surfaces as a marker of depth. It's a number that has followed me across many domains of life.

The dot dev domain isn't just a TLD. It's a declaration. The commitment to the highest level of programming craft — and to pushing AI to its full potential. Not as a tool, but as an extension of intention.

The visual identity reflects those same values: a command center aesthetic — expansive but controlled. Minimalist but precise. Calm, effective, aware. js17.dev is built for engineers who think clearly and build with purpose.`

const SLIDES = [
  {
    title: "The Name Behind the Brand",
    bullets: ["js · 17 · .dev", "Three elements, one identity", "Each chosen with intention"],
    estimatedDuration: 12,
  },
  {
    title: "js — The Craftsman's Mark",
    bullets: ["Jeroham Sanchez — initials", "Tribute to JavaScript & its ecosystem", "From React to Node.js to the edge"],
    estimatedDuration: 16,
  },
  {
    title: "17 — More Than a Number",
    bullets: ["A prime in number theory", "The Star — hope & inspiration (Tarot)", "Present across mathematics, philosophy, arts"],
    estimatedDuration: 16,
  },
  {
    title: ".dev — The Declaration",
    bullets: ["Not just a domain extension", "Commitment to programming mastery", "AI as an extension of intention"],
    estimatedDuration: 14,
  },
  {
    title: "Command. Expand. Aware.",
    bullets: ["Minimalist · Calm · Effective", "Built for engineers who think clearly", "js17.dev"],
    estimatedDuration: 17,
  },
]

const TOTAL_DURATION = SLIDES.reduce((sum, s) => sum + s.estimatedDuration, 0) // 75s

const LOGO_SVG_LONG = `<svg width="80" height="80" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#3b82f6" stroke-width="10" stroke-linecap="round"><line x1="250" y1="200" x2="250" y2="350"/><path d="M250 240 L170 170"/><path d="M250 240 L330 170"/><path d="M250 275 L185 220"/><path d="M250 275 L315 220"/><path d="M250 310 L200 270"/><path d="M250 310 L300 270"/><circle cx="170" cy="170" r="7" fill="#080d1a" stroke="#3b82f6" stroke-width="4"/><circle cx="330" cy="170" r="7" fill="#080d1a" stroke="#3b82f6" stroke-width="4"/><circle cx="185" cy="220" r="7" fill="#080d1a" stroke="#3b82f6" stroke-width="4"/><circle cx="315" cy="220" r="7" fill="#080d1a" stroke="#3b82f6" stroke-width="4"/><circle cx="200" cy="270" r="7" fill="#080d1a" stroke="#3b82f6" stroke-width="4"/><circle cx="300" cy="270" r="7" fill="#080d1a" stroke="#3b82f6" stroke-width="4"/></g><text x="250" y="430" font-family="Arial,sans-serif" font-size="75" font-weight="bold" text-anchor="middle" fill="#f8fafc">JS17</text></svg>`

function buildSlideHtml(title: string, bullets: string[], isLast: boolean): string {
  const bulletItems = bullets
    .map((b) => `<li>${b.replace(/\n/g, "<br>")}</li>`)
    .join("")

  const titleStyle = isLast
    ? "font-size:58px;font-weight:900;color:#f8fafc;line-height:1.05;text-align:center;margin-bottom:32px;letter-spacing:-1.5px;"
    : "font-size:46px;font-weight:800;color:#f8fafc;line-height:1.1;text-align:center;margin-bottom:32px;letter-spacing:-1px;"

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{width:1280px;height:720px;background:linear-gradient(135deg,#060b14 0%,#0d1526 50%,#060b14 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 100px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative}.logo-row{display:flex;align-items:center;gap:12px;margin-bottom:32px}.accent{font-size:15px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#2563eb;font-family:'Courier New',monospace}.title{${titleStyle}}.divider{width:48px;height:2px;background:#2563eb;border-radius:2px;margin-bottom:28px}.bullets{list-style:none;text-align:center;width:100%}.bullets li{font-size:22px;color:#94a3b8;margin-bottom:10px;line-height:1.5}.brand{position:absolute;bottom:28px;right:48px;font-size:16px;font-family:'Courier New',monospace;font-weight:700;color:#2563eb;opacity:0.7}</style></head><body><div class="logo-row">${LOGO_SVG_LONG}<span class="accent">js17.dev</span></div><h1 class="title">${title.replace(/\n/g, "<br>")}</h1><div class="divider"></div><ul class="bullets">${bulletItems}</ul><div class="brand">js17.dev</div></body></html>`
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
    speed: 0.92,
  })
  const audioBuffer = Buffer.from(await audioStream.arrayBuffer())
  const { url: audioUrl } = await put(`audio/logo-long-${Date.now()}.mp3`, audioBuffer, {
    access: "public",
    contentType: "audio/mpeg",
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  // Step 2: Build Shotstack payload (horizontal 1280×720)
  let currentTime = 0
  const slideClips = SLIDES.map((slide, i) => {
    const isLast = i === SLIDES.length - 1
    const html = buildSlideHtml(slide.title, slide.bullets, isLast)
    const clip = {
      asset: {
        type: "html",
        html,
        width: 1280,
        height: 720,
        background: "transparent",
      },
      start: currentTime,
      length: slide.estimatedDuration,
      effect: i === 0 ? "zoomIn" : "zoomInSlow",
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
    resolution: "hd",
    fps: 25,
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
    const detail = shotData?.response?.message || shotData?.errors?.[0]?.detail || shotData.message || JSON.stringify(shotData)
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
    youtubeTitle: "js17.dev — The Meaning Behind the Brand",
    youtubeTags: ["js17dev", "JavaScript", "AIEngineering", "Fullstack", "WebDevelopment", "Developer", "Branding", "TechBrand", "Programming", "SoftwareEngineering", "FullstackDeveloper"],
    siteUrl,
  })
}
