import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"

interface SlideInput {
  title: string
  bullets: string[]
  estimatedDuration: number
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function buildSlideHtmlShort(title: string, bullets: string[], slideNum: number, total: number): string {
  const bulletItems = bullets
    .slice(0, 3)
    .map((b) => `<li>${escapeHtml(b)}</li>`)
    .join("")

  const dots = Array.from({ length: total })
    .map((_, i) => `<span style="width:10px;height:10px;border-radius:50%;background:${i + 1 === slideNum ? "#3b82f6" : "rgba(255,255,255,0.15)"}"></span>`)
    .join("")

  const fontSize = title.length > 30 ? "68px" : "84px"

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;background:#080d1a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 80px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;overflow:hidden}.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.05) 1px,transparent 1px);background-size:80px 80px}.glow{position:absolute;top:-200px;right:-200px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)}.brand{font-family:'Courier New',monospace;font-size:28px;font-weight:700;color:#3b82f6;margin-bottom:60px}.title{font-size:${fontSize};font-weight:900;color:#f8fafc;line-height:1.1;margin-bottom:48px;letter-spacing:-0.03em;text-align:center}.divider{width:60px;height:3px;background:#3b82f6;border-radius:2px;margin-bottom:48px}.bullets{list-style:none;text-align:center;width:100%}.bullets li{font-size:32px;color:#94a3b8;margin-bottom:24px;line-height:1.4}.bullets li::before{content:"\\25B8 ";color:#3b82f6;font-size:28px}.dots{display:flex;gap:12px;position:absolute;bottom:80px}</style></head><body><div class="grid"></div><div class="glow"></div><div class="brand">js17.dev</div><h1 class="title">${escapeHtml(title)}</h1><div class="divider"></div><ul class="bullets">${bulletItems}</ul><div class="dots">${dots}</div></body></html>`
}

function buildSlideHtmlLong(title: string, bullets: string[], slideNum: number, total: number): string {
  const bulletItems = bullets
    .slice(0, 5)
    .map((b) => `<li>${escapeHtml(b)}</li>`)
    .join("")

  const fontSize = title.length > 45 ? "38px" : title.length > 30 ? "46px" : "54px"
  const progressWidth = Math.round((slideNum / total) * 100)

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{width:1280px;height:720px;background:#080d1a;display:flex;flex-direction:column;padding:60px 80px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;overflow:hidden}.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.06) 1px,transparent 1px);background-size:60px 60px}.glow{position:absolute;top:-100px;right:-100px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)}.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:48px;position:relative;z-index:1}.header .brand{font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#3b82f6}.header .counter{font-size:14px;color:#334155;font-family:'Courier New',monospace}.title{font-size:${fontSize};font-weight:800;color:#f8fafc;line-height:1.15;margin-bottom:36px;letter-spacing:-0.02em;max-width:900px;position:relative;z-index:1}.bullets{list-style:none;flex:1;position:relative;z-index:1}.bullets li{font-size:22px;color:#94a3b8;margin-bottom:18px;line-height:1.5}.bullets li::before{content:"\\25B8 ";color:#3b82f6;font-size:22px}.bar{position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#3b82f6,#1d4ed8,#3b82f6)}.progress{position:absolute;bottom:4px;left:0;height:2px;width:${progressWidth}%;background:rgba(255,255,255,0.15)}</style></head><body><div class="grid"></div><div class="glow"></div><div class="header"><span class="brand">js17.dev</span><span class="counter">${slideNum} / ${total}</span></div><h1 class="title">${escapeHtml(title)}</h1><ul class="bullets">${bulletItems}</ul><div class="bar"></div><div class="progress"></div></body></html>`
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slides, audioUrl, totalDuration, videoFormat = "long" } = await req.json()
  const isShort = videoFormat === "short"

  // Build slide clips with inline HTML (Shotstack renders HTML directly)
  let currentTime = 0
  const slideClips = slides.map((slide: SlideInput, i: number) => {
    const html = isShort
      ? buildSlideHtmlShort(slide.title, slide.bullets, i + 1, slides.length)
      : buildSlideHtmlLong(slide.title, slide.bullets, i + 1, slides.length)

    const clip = {
      asset: {
        type: "html",
        html,
        width: isShort ? 1080 : 1280,
        height: isShort ? 1920 : 720,
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

  const shotstackEnv = process.env.SHOTSTACK_ENV || "stage"
  const res = await fetch(`https://api.shotstack.io/${shotstackEnv}/render`, {
    method: "POST",
    headers: {
      "x-api-key": (process.env.SHOTSTACK_API_KEY || "").trim(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ timeline, output }),
  })

  const respData = await res.json()
  if (!res.ok) {
    const detail = respData?.response?.message || respData?.errors?.[0]?.detail || respData.message || JSON.stringify(respData)
    return NextResponse.json({ error: `Shotstack ${shotstackEnv}: ${detail}` }, { status: 500 })
  }

  const jobId = respData?.response?.id
  if (!jobId) {
    return NextResponse.json({ error: "No job ID in Shotstack response" }, { status: 500 })
  }

  return NextResponse.json({ jobId })
}
