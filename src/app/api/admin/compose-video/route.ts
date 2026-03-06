import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"

interface VisualItem { icon: string; label: string }

interface SlideInput {
  type?: string
  icon?: string
  title: string
  visual?: VisualItem[]
  bullets?: string[] // backward compat
  narration: string
  estimatedDuration: number
}

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/* ─── Shared CSS fragments ───────────────────────────────────────────────── */

const BG_COLOR = "#06080f"

function gridCss(size: number): string {
  return `position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px);background-size:${size}px ${size}px`
}

function glowCss(x: string, y: string, r: number, opacity: number): string {
  return `position:absolute;${x};${y};width:${r}px;height:${r}px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,${opacity}) 0%,transparent 70%)`
}

function dotsCss(total: number, current: number): string {
  return Array.from({ length: total })
    .map((_, i) => `<span style="width:10px;height:10px;border-radius:50%;background:${i + 1 === current ? "#3b82f6" : "rgba(255,255,255,0.12)"}"></span>`)
    .join("")
}

function barHtml(): string {
  return `<div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#3b82f6,#8b5cf6,#06b6d4)"></div>`
}

function progressHtml(current: number, total: number): string {
  const pct = Math.round((current / total) * 100)
  return `<div style="position:absolute;bottom:4px;left:0;height:2px;width:${pct}%;background:rgba(255,255,255,0.12)"></div>`
}

function itemCardHtml(item: VisualItem, fontSize: number, gap: number, pad: string, iconSize: number): string {
  return `<div style="display:flex;align-items:center;gap:${gap}px;padding:${pad};background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.1);border-radius:12px"><span style="font-size:${iconSize}px;flex-shrink:0">${item.icon}</span><span style="font-size:${fontSize}px;color:#cbd5e1;font-weight:500">${esc(item.label)}</span></div>`
}

function statCardHtml(item: VisualItem, valueSize: number, labelSize: number): string {
  return `<div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.1);border-radius:16px;padding:20px 16px;text-align:center;flex:1"><div style="font-size:${valueSize}px;font-weight:900;color:#3b82f6;font-family:'Courier New',monospace">${item.icon}</div><div style="font-size:${labelSize}px;color:#94a3b8;margin-top:6px;line-height:1.3">${esc(item.label)}</div></div>`
}

/* ─── Resolve visual items (backward compat with bullets) ─────────────── */

function resolveVisual(slide: SlideInput): VisualItem[] {
  if (slide.visual && slide.visual.length > 0) return slide.visual
  if (slide.bullets) return slide.bullets.map(b => ({ icon: "▸", label: b }))
  return []
}

/* ─── SHORT Templates (1080×1920) ────────────────────────────────────────── */

function shortHook(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide)
  const icon = slide.icon || "🔥"
  const subtitle = items[0]?.label || ""
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="width:1080px;height:1920px;background:${BG_COLOR};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 80px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(80)}"></div><div style="${glowCss("top:-200px", "right:-200px", 800, 0.12)}"></div><div style="${glowCss("bottom:-200px", "left:-100px", 600, 0.06)}"></div><div style="font-family:'Courier New',monospace;font-size:28px;font-weight:700;color:#3b82f6;margin-bottom:60px;position:relative;z-index:1">js17.dev</div><div style="font-size:140px;margin-bottom:40px;position:relative;z-index:1">${icon}</div><h1 style="font-size:${slide.title.length > 25 ? 64 : 80}px;font-weight:900;color:#f1f5f9;line-height:1.05;text-align:center;letter-spacing:-0.03em;margin:0 0 24px;position:relative;z-index:1;background:linear-gradient(135deg,#f1f5f9,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${esc(slide.title)}</h1>${subtitle ? `<p style="font-size:28px;color:#64748b;text-align:center;position:relative;z-index:1;max-width:800px">${esc(subtitle)}</p>` : ""}<div style="display:flex;gap:12px;position:absolute;bottom:80px">${dotsCss(total, n)}</div>${barHtml()}</body></html>`
}

function shortInsight(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 3)
  const icon = slide.icon || "💡"
  const cards = items.map(item => itemCardHtml(item, 26, 16, "18px 24px", 36)).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="width:1080px;height:1920px;background:${BG_COLOR};display:flex;flex-direction:column;align-items:center;padding:100px 80px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(80)}"></div><div style="${glowCss("top:-100px", "left:-100px", 600, 0.08)}"></div><div style="font-family:'Courier New',monospace;font-size:24px;font-weight:700;color:#3b82f6;margin-bottom:50px;position:relative;z-index:1">js17.dev</div><div style="font-size:80px;margin-bottom:30px;position:relative;z-index:1">${icon}</div><h1 style="font-size:${slide.title.length > 25 ? 56 : 68}px;font-weight:900;color:#f1f5f9;line-height:1.1;text-align:center;letter-spacing:-0.02em;margin:0 0 16px;position:relative;z-index:1">${esc(slide.title)}</h1><div style="width:60px;height:3px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:2px;margin-bottom:40px"></div><div style="display:flex;flex-direction:column;gap:14px;width:100%;max-width:900px;position:relative;z-index:1">${cards}</div><div style="display:flex;gap:12px;position:absolute;bottom:80px">${dotsCss(total, n)}</div>${barHtml()}</body></html>`
}

function shortStats(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 4)
  const icon = slide.icon || "📊"
  const cards = items.map(item => statCardHtml(item, 40, 16)).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="width:1080px;height:1920px;background:${BG_COLOR};display:flex;flex-direction:column;align-items:center;padding:100px 80px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(80)}"></div><div style="${glowCss("top:-100px", "right:-100px", 600, 0.08)}"></div><div style="font-family:'Courier New',monospace;font-size:24px;font-weight:700;color:#3b82f6;margin-bottom:50px;position:relative;z-index:1">js17.dev</div><div style="font-size:80px;margin-bottom:24px;position:relative;z-index:1">${icon}</div><h1 style="font-size:${slide.title.length > 25 ? 52 : 64}px;font-weight:900;color:#f1f5f9;line-height:1.1;text-align:center;letter-spacing:-0.02em;margin:0 0 40px;position:relative;z-index:1">${esc(slide.title)}</h1><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;width:100%;max-width:900px;position:relative;z-index:1">${cards}</div><div style="display:flex;gap:12px;position:absolute;bottom:80px">${dotsCss(total, n)}</div>${barHtml()}</body></html>`
}

function shortCta(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 3)
  const ctaCards = items.map(item =>
    `<div style="display:flex;align-items:center;gap:16px;padding:20px 32px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);border-radius:16px"><span style="font-size:36px">${item.icon}</span><span style="font-size:28px;color:#e2e8f0;font-weight:600">${esc(item.label)}</span></div>`
  ).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="width:1080px;height:1920px;background:linear-gradient(160deg,${BG_COLOR} 0%,#0f172a 40%,#1e1b4b 70%,${BG_COLOR} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 80px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;overflow:hidden"><div style="${glowCss("top:50%", "left:50%", 800, 0.1)};transform:translate(-50%,-50%)"></div><div style="font-family:'Courier New',monospace;font-size:48px;font-weight:900;color:#3b82f6;margin-bottom:16px;position:relative;z-index:1;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">js17.dev</div><p style="font-size:22px;color:#64748b;margin-bottom:60px;position:relative;z-index:1">Senior AI-Augmented Fullstack Engineer</p><div style="display:flex;flex-direction:column;gap:16px;width:100%;max-width:800px;position:relative;z-index:1;margin-bottom:50px">${ctaCards}</div><div style="width:200px;height:2px;background:linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent);margin-bottom:24px"></div><p style="font-size:20px;color:#475569;position:relative;z-index:1">Subscribe &middot; Like &middot; Share</p><div style="display:flex;gap:12px;position:absolute;bottom:80px">${dotsCss(total, n)}</div>${barHtml()}</body></html>`
}

/* ─── LONG Templates (1280×720) ──────────────────────────────────────────── */

function longHook(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide)
  const icon = slide.icon || "🔥"
  const subtitle = items[0]?.label || ""
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="width:1280px;height:720px;background:${BG_COLOR};display:flex;flex-direction:column;padding:50px 70px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(60)}"></div><div style="${glowCss("top:-150px", "right:-100px", 600, 0.12)}"></div><div style="${glowCss("bottom:-100px", "left:-100px", 400, 0.06)}"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:30px;position:relative;z-index:1"><span style="font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#3b82f6">js17.dev</span><span style="font-size:13px;color:#334155;font-family:'Courier New',monospace">${n} / ${total}</span></div><div style="display:flex;align-items:center;flex:1;gap:50px;position:relative;z-index:1"><div style="font-size:120px;flex-shrink:0">${icon}</div><div><h1 style="font-size:${slide.title.length > 35 ? 40 : 52}px;font-weight:900;color:#f1f5f9;line-height:1.1;letter-spacing:-0.02em;margin:0 0 16px;background:linear-gradient(135deg,#f1f5f9,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${esc(slide.title)}</h1>${subtitle ? `<p style="font-size:22px;color:#64748b;margin:0">${esc(subtitle)}</p>` : ""}</div></div>${barHtml()}${progressHtml(n, total)}</body></html>`
}

function longInsight(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 5)
  const icon = slide.icon || "💡"
  const twoCol = items.length >= 4
  const cards = items.map(item => itemCardHtml(item, 18, 12, "12px 18px", 26)).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="width:1280px;height:720px;background:${BG_COLOR};display:flex;flex-direction:column;padding:50px 70px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(60)}"></div><div style="${glowCss("top:-80px", "left:-80px", 400, 0.07)}"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;position:relative;z-index:1"><span style="font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#3b82f6">js17.dev</span><span style="font-size:13px;color:#334155;font-family:'Courier New',monospace">${n} / ${total}</span></div><div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;position:relative;z-index:1"><span style="font-size:44px">${icon}</span><h1 style="font-size:${slide.title.length > 35 ? 32 : 40}px;font-weight:800;color:#f1f5f9;line-height:1.15;letter-spacing:-0.02em;margin:0">${esc(slide.title)}</h1></div><div style="display:${twoCol ? "grid" : "flex"};${twoCol ? "grid-template-columns:1fr 1fr" : "flex-direction:column"};gap:10px;flex:1;position:relative;z-index:1;align-content:start">${cards}</div>${barHtml()}${progressHtml(n, total)}</body></html>`
}

function longStats(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 4)
  const icon = slide.icon || "📊"
  const cards = items.map(item => statCardHtml(item, 32, 14)).join("")
  const cols = items.length <= 2 ? items.length : items.length <= 4 ? 2 : 3
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="width:1280px;height:720px;background:${BG_COLOR};display:flex;flex-direction:column;padding:50px 70px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(60)}"></div><div style="${glowCss("top:-80px", "right:-80px", 400, 0.08)}"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;position:relative;z-index:1"><span style="font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#3b82f6">js17.dev</span><span style="font-size:13px;color:#334155;font-family:'Courier New',monospace">${n} / ${total}</span></div><div style="display:flex;align-items:center;gap:20px;margin-bottom:30px;position:relative;z-index:1"><span style="font-size:44px">${icon}</span><h1 style="font-size:${slide.title.length > 35 ? 32 : 40}px;font-weight:800;color:#f1f5f9;line-height:1.15;letter-spacing:-0.02em;margin:0">${esc(slide.title)}</h1></div><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:14px;flex:1;position:relative;z-index:1;align-content:start">${cards}</div>${barHtml()}${progressHtml(n, total)}</body></html>`
}

function longCta(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 3)
  const ctaCards = items.map(item =>
    `<div style="display:flex;align-items:center;gap:14px;padding:16px 28px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.12);border-radius:14px"><span style="font-size:28px">${item.icon}</span><span style="font-size:22px;color:#e2e8f0;font-weight:600">${esc(item.label)}</span></div>`
  ).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="width:1280px;height:720px;background:linear-gradient(160deg,${BG_COLOR} 0%,#0f172a 40%,#1e1b4b 70%,${BG_COLOR} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 70px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;position:relative;overflow:hidden"><div style="${glowCss("top:50%", "left:50%", 600, 0.1)};transform:translate(-50%,-50%)"></div><div style="font-family:'Courier New',monospace;font-size:40px;font-weight:900;position:relative;z-index:1;margin-bottom:10px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">js17.dev</div><p style="font-size:16px;color:#64748b;margin-bottom:40px;position:relative;z-index:1">Senior AI-Augmented Fullstack Engineer</p><div style="display:flex;flex-direction:column;gap:12px;position:relative;z-index:1;margin-bottom:30px">${ctaCards}</div><div style="width:160px;height:2px;background:linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent);margin-bottom:16px"></div><p style="font-size:14px;color:#475569;position:relative;z-index:1">Subscribe &middot; Like &middot; Share</p>${barHtml()}${progressHtml(n, total)}</body></html>`
}

/* ─── Slide Router ────────────────────────────────────────────────────────── */

function buildSlideHtml(slide: SlideInput, n: number, total: number, isShort: boolean): string {
  const type = slide.type || "insight"
  if (isShort) {
    switch (type) {
      case "hook": case "intro": return shortHook(slide, n, total)
      case "stats": return shortStats(slide, n, total)
      case "cta": return shortCta(slide, n, total)
      default: return shortInsight(slide, n, total)
    }
  } else {
    switch (type) {
      case "hook": case "intro": return longHook(slide, n, total)
      case "stats": return longStats(slide, n, total)
      case "cta": return longCta(slide, n, total)
      default: return longInsight(slide, n, total)
    }
  }
}

/* ─── Shotstack Effects ──────────────────────────────────────────────────── */

function getEffect(type: string | undefined, index: number): string {
  if (type === "hook" || type === "intro") return "zoomIn"
  if (type === "cta") return "zoomIn"
  if (type === "stats") return "zoomInSlow"
  return index % 2 === 0 ? "slideRight" : "slideLeft"
}

/* ─── Route Handler ──────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slides, audioUrl, totalDuration, videoFormat = "long" } = await req.json()
  const isShort = videoFormat === "short"

  let currentTime = 0
  const slideClips = slides.map((slide: SlideInput, i: number) => {
    const html = buildSlideHtml(slide, i + 1, slides.length, isShort)
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
      effect: getEffect(slide.type, i),
      transition: { in: "fade", out: "fade" },
    }
    currentTime += slide.estimatedDuration
    return clip
  })

  const timeline = {
    background: BG_COLOR,
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
