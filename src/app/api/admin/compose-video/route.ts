import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"

interface VisualItem { icon: string; label: string }

interface SlideInput {
  type?: string
  icon?: string
  title: string
  visual?: VisualItem[]
  bullets?: string[]
  narration: string
  estimatedDuration: number
  chapterNumber?: number
  columnA?: { heading: string; items: VisualItem[] }
  columnB?: { heading: string; items: VisualItem[] }
  codeLines?: string[]
  backgroundImageUrl?: string
}

interface AudioSlide {
  slideIndex: number
  url: string
  durationSeconds: number
}

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/* ─── Shared CSS & HTML fragments ─────────────────────────────────────────── */

const BG_COLOR = "#06080f"

const FONT_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">`

const CODE_LINKS = `<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet"><script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>`

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
  return `<div style="display:flex;align-items:center;gap:${gap}px;padding:${pad};background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.1);border-radius:12px"><span style="font-size:${iconSize}px;flex-shrink:0">${item.icon}</span><span style="font-size:${fontSize}px;color:#cbd5e1;font-weight:500;font-family:'Inter',sans-serif">${esc(item.label)}</span></div>`
}

function statCardHtml(item: VisualItem, valueSize: number, labelSize: number): string {
  return `<div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.1);border-radius:16px;padding:20px 16px;text-align:center;flex:1"><div style="font-size:${valueSize}px;font-weight:900;color:#3b82f6;font-family:'JetBrains Mono',monospace">${item.icon}</div><div style="font-size:${labelSize}px;color:#94a3b8;margin-top:6px;line-height:1.3;font-family:'Inter',sans-serif">${esc(item.label)}</div></div>`
}

function bgImageHtml(slide: SlideInput): string {
  if (!slide.backgroundImageUrl) return ""
  return `<div style="position:absolute;inset:0;background-image:url('${slide.backgroundImageUrl}');background-size:cover;background-position:center;opacity:0.18;filter:saturate(0.6) brightness(0.7)"></div><div style="position:absolute;inset:0;background:rgba(6,8,15,0.72)"></div>`
}

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
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1080px;height:1920px;background:${BG_COLOR};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 80px;font-family:'Inter',sans-serif;position:relative;overflow:hidden">${bgImageHtml(slide)}<div style="${gridCss(80)}"></div><div style="${glowCss("top:-200px", "right:-200px", 800, 0.12)}"></div><div style="${glowCss("bottom:-200px", "left:-100px", 600, 0.06)}"></div><div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:#3b82f6;margin-bottom:60px;position:relative;z-index:1">js17.dev</div><div style="font-size:140px;margin-bottom:40px;position:relative;z-index:1">${icon}</div><h1 style="font-size:${slide.title.length > 25 ? 64 : 80}px;font-weight:900;color:#f1f5f9;line-height:1.05;text-align:center;letter-spacing:-0.03em;margin:0 0 24px;position:relative;z-index:1;background:linear-gradient(135deg,#f1f5f9,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-family:'Inter',sans-serif">${esc(slide.title)}</h1>${subtitle ? `<p style="font-size:28px;color:#64748b;text-align:center;position:relative;z-index:1;max-width:800px;font-family:'Inter',sans-serif">${esc(subtitle)}</p>` : ""}<div style="display:flex;gap:12px;position:absolute;bottom:80px">${dotsCss(total, n)}</div>${barHtml()}</body></html>`
}

function shortInsight(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 3)
  const icon = slide.icon || "💡"
  const cards = items.map(item => itemCardHtml(item, 26, 16, "18px 24px", 36)).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1080px;height:1920px;background:${BG_COLOR};display:flex;flex-direction:column;align-items:center;padding:100px 80px;font-family:'Inter',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(80)}"></div><div style="${glowCss("top:-100px", "left:-100px", 600, 0.08)}"></div><div style="font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:700;color:#3b82f6;margin-bottom:50px;position:relative;z-index:1">js17.dev</div><div style="font-size:80px;margin-bottom:30px;position:relative;z-index:1">${icon}</div><h1 style="font-size:${slide.title.length > 25 ? 56 : 68}px;font-weight:900;color:#f1f5f9;line-height:1.1;text-align:center;letter-spacing:-0.02em;margin:0 0 16px;position:relative;z-index:1;font-family:'Inter',sans-serif">${esc(slide.title)}</h1><div style="width:60px;height:3px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:2px;margin-bottom:40px"></div><div style="display:flex;flex-direction:column;gap:14px;width:100%;max-width:900px;position:relative;z-index:1">${cards}</div><div style="display:flex;gap:12px;position:absolute;bottom:80px">${dotsCss(total, n)}</div>${barHtml()}</body></html>`
}

function shortStats(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 4)
  const icon = slide.icon || "📊"
  const cards = items.map(item => statCardHtml(item, 40, 16)).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1080px;height:1920px;background:${BG_COLOR};display:flex;flex-direction:column;align-items:center;padding:100px 80px;font-family:'Inter',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(80)}"></div><div style="${glowCss("top:-100px", "right:-100px", 600, 0.08)}"></div><div style="font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:700;color:#3b82f6;margin-bottom:50px;position:relative;z-index:1">js17.dev</div><div style="font-size:80px;margin-bottom:24px;position:relative;z-index:1">${icon}</div><h1 style="font-size:${slide.title.length > 25 ? 52 : 64}px;font-weight:900;color:#f1f5f9;line-height:1.1;text-align:center;letter-spacing:-0.02em;margin:0 0 40px;position:relative;z-index:1;font-family:'Inter',sans-serif">${esc(slide.title)}</h1><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;width:100%;max-width:900px;position:relative;z-index:1">${cards}</div><div style="display:flex;gap:12px;position:absolute;bottom:80px">${dotsCss(total, n)}</div>${barHtml()}</body></html>`
}

function shortCta(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 3)
  const ctaCards = items.map(item =>
    `<div style="display:flex;align-items:center;gap:16px;padding:20px 32px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);border-radius:16px"><span style="font-size:36px">${item.icon}</span><span style="font-size:28px;color:#e2e8f0;font-weight:600;font-family:'Inter',sans-serif">${esc(item.label)}</span></div>`
  ).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1080px;height:1920px;background:linear-gradient(160deg,${BG_COLOR} 0%,#0f172a 40%,#1e1b4b 70%,${BG_COLOR} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 80px;font-family:'Inter',sans-serif;position:relative;overflow:hidden">${bgImageHtml(slide)}<div style="${glowCss("top:50%", "left:50%", 800, 0.1)};transform:translate(-50%,-50%)"></div><div style="font-family:'JetBrains Mono',monospace;font-size:48px;font-weight:900;color:#3b82f6;margin-bottom:16px;position:relative;z-index:1;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">js17.dev</div><p style="font-size:22px;color:#64748b;margin-bottom:60px;position:relative;z-index:1;font-family:'Inter',sans-serif">Senior AI-Augmented Fullstack Engineer</p><div style="display:flex;flex-direction:column;gap:16px;width:100%;max-width:800px;position:relative;z-index:1;margin-bottom:50px">${ctaCards}</div><div style="width:200px;height:2px;background:linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent);margin-bottom:24px"></div><p style="font-size:20px;color:#475569;position:relative;z-index:1;font-family:'Inter',sans-serif">Subscribe &middot; Like &middot; Share</p><div style="display:flex;gap:12px;position:absolute;bottom:80px">${dotsCss(total, n)}</div>${barHtml()}</body></html>`
}

function shortCodeBlock(slide: SlideInput, n: number, total: number): string {
  const icon = slide.icon || "💻"
  const codeLines = (slide.codeLines || []).slice(0, 6)
  const codeHtml = codeLines.map(l => esc(l)).join("\n")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}${CODE_LINKS}</head><body style="width:1080px;height:1920px;background:${BG_COLOR};display:flex;flex-direction:column;align-items:center;padding:80px 70px;font-family:'Inter',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(80)}"></div><div style="${glowCss("top:-100px", "left:-100px", 500, 0.08)}"></div><div style="font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:700;color:#3b82f6;margin-bottom:40px;position:relative;z-index:1">js17.dev</div><div style="font-size:70px;margin-bottom:20px;position:relative;z-index:1">${icon}</div><h1 style="font-size:${slide.title.length > 25 ? 52 : 64}px;font-weight:900;color:#f1f5f9;line-height:1.1;text-align:center;letter-spacing:-0.02em;margin:0 0 30px;position:relative;z-index:1;font-family:'Inter',sans-serif">${esc(slide.title)}</h1><div style="width:100%;max-width:920px;position:relative;z-index:1"><pre class="language-typescript" style="background:#0a0f1e;border-radius:12px;padding:28px;font-size:22px;margin:0;overflow:hidden;font-family:'JetBrains Mono',monospace"><code class="language-typescript">${codeHtml}</code></pre></div><div style="display:flex;gap:12px;position:absolute;bottom:80px">${dotsCss(total, n)}</div>${barHtml()}</body></html>`
}

/* ─── LONG Templates (1280×720) ──────────────────────────────────────────── */

function longHook(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide)
  const icon = slide.icon || "🔥"
  const subtitle = items[0]?.label || ""
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1280px;height:720px;background:${BG_COLOR};display:flex;flex-direction:column;padding:50px 70px;font-family:'Inter',sans-serif;position:relative;overflow:hidden">${bgImageHtml(slide)}<div style="${gridCss(60)}"></div><div style="${glowCss("top:-150px", "right:-100px", 600, 0.12)}"></div><div style="${glowCss("bottom:-100px", "left:-100px", 400, 0.06)}"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:30px;position:relative;z-index:1"><span style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#3b82f6">js17.dev</span><span style="font-size:13px;color:#334155;font-family:'JetBrains Mono',monospace">${n} / ${total}</span></div><div style="display:flex;align-items:center;flex:1;gap:50px;position:relative;z-index:1"><div style="font-size:120px;flex-shrink:0">${icon}</div><div><h1 style="font-size:${slide.title.length > 35 ? 40 : 52}px;font-weight:900;color:#f1f5f9;line-height:1.1;letter-spacing:-0.02em;margin:0 0 16px;background:linear-gradient(135deg,#f1f5f9,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-family:'Inter',sans-serif">${esc(slide.title)}</h1>${subtitle ? `<p style="font-size:22px;color:#64748b;margin:0;font-family:'Inter',sans-serif">${esc(subtitle)}</p>` : ""}</div></div>${barHtml()}${progressHtml(n, total)}</body></html>`
}

function longInsight(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 5)
  const icon = slide.icon || "💡"
  const twoCol = items.length >= 4
  const cards = items.map(item => itemCardHtml(item, 18, 12, "12px 18px", 26)).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1280px;height:720px;background:${BG_COLOR};display:flex;flex-direction:column;padding:50px 70px;font-family:'Inter',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(60)}"></div><div style="${glowCss("top:-80px", "left:-80px", 400, 0.07)}"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;position:relative;z-index:1"><span style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#3b82f6">js17.dev</span><span style="font-size:13px;color:#334155;font-family:'JetBrains Mono',monospace">${n} / ${total}</span></div><div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;position:relative;z-index:1"><span style="font-size:44px">${icon}</span><h1 style="font-size:${slide.title.length > 35 ? 32 : 40}px;font-weight:800;color:#f1f5f9;line-height:1.15;letter-spacing:-0.02em;margin:0;font-family:'Inter',sans-serif">${esc(slide.title)}</h1></div><div style="display:${twoCol ? "grid" : "flex"};${twoCol ? "grid-template-columns:1fr 1fr" : "flex-direction:column"};gap:10px;flex:1;position:relative;z-index:1;align-content:start">${cards}</div>${barHtml()}${progressHtml(n, total)}</body></html>`
}

function longStats(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 4)
  const icon = slide.icon || "📊"
  const cards = items.map(item => statCardHtml(item, 32, 14)).join("")
  const cols = items.length <= 2 ? items.length : 2
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1280px;height:720px;background:${BG_COLOR};display:flex;flex-direction:column;padding:50px 70px;font-family:'Inter',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(60)}"></div><div style="${glowCss("top:-80px", "right:-80px", 400, 0.08)}"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;position:relative;z-index:1"><span style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#3b82f6">js17.dev</span><span style="font-size:13px;color:#334155;font-family:'JetBrains Mono',monospace">${n} / ${total}</span></div><div style="display:flex;align-items:center;gap:20px;margin-bottom:30px;position:relative;z-index:1"><span style="font-size:44px">${icon}</span><h1 style="font-size:${slide.title.length > 35 ? 32 : 40}px;font-weight:800;color:#f1f5f9;line-height:1.15;letter-spacing:-0.02em;margin:0;font-family:'Inter',sans-serif">${esc(slide.title)}</h1></div><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:14px;flex:1;position:relative;z-index:1;align-content:start">${cards}</div>${barHtml()}${progressHtml(n, total)}</body></html>`
}

function longCta(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 3)
  const ctaCards = items.map(item =>
    `<div style="display:flex;align-items:center;gap:14px;padding:16px 28px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.12);border-radius:14px"><span style="font-size:28px">${item.icon}</span><span style="font-size:22px;color:#e2e8f0;font-weight:600;font-family:'Inter',sans-serif">${esc(item.label)}</span></div>`
  ).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1280px;height:720px;background:linear-gradient(160deg,${BG_COLOR} 0%,#0f172a 40%,#1e1b4b 70%,${BG_COLOR} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 70px;font-family:'Inter',sans-serif;position:relative;overflow:hidden">${bgImageHtml(slide)}<div style="${glowCss("top:50%", "left:50%", 600, 0.1)};transform:translate(-50%,-50%)"></div><div style="font-family:'JetBrains Mono',monospace;font-size:40px;font-weight:900;position:relative;z-index:1;margin-bottom:10px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">js17.dev</div><p style="font-size:16px;color:#64748b;margin-bottom:40px;position:relative;z-index:1;font-family:'Inter',sans-serif">Senior AI-Augmented Fullstack Engineer</p><div style="display:flex;flex-direction:column;gap:12px;position:relative;z-index:1;margin-bottom:30px">${ctaCards}</div><div style="width:160px;height:2px;background:linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent);margin-bottom:16px"></div><p style="font-size:14px;color:#475569;position:relative;z-index:1;font-family:'Inter',sans-serif">Subscribe &middot; Like &middot; Share</p>${barHtml()}${progressHtml(n, total)}</body></html>`
}

function longChapterDivider(slide: SlideInput, n: number, total: number): string {
  const chapterNum = slide.chapterNumber ?? n
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1280px;height:720px;background:${BG_COLOR};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 70px;font-family:'Inter',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(60)}"></div><div style="${glowCss("top:50%", "left:50%", 700, 0.07)};transform:translate(-50%,-50%)"></div><div style="display:flex;align-items:center;justify-content:space-between;position:absolute;top:30px;left:70px;right:70px;z-index:1"><span style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:#3b82f6">js17.dev</span><span style="font-size:12px;color:#334155;font-family:'JetBrains Mono',monospace">${n} / ${total}</span></div><div style="text-align:center;position:relative;z-index:1"><div style="font-size:13px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#3b82f6;font-family:'JetBrains Mono',monospace;margin-bottom:16px">CHAPTER ${chapterNum}</div><div style="width:40px;height:3px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:2px;margin:0 auto 28px"></div><h1 style="font-size:${slide.title.length > 35 ? 44 : 56}px;font-weight:900;color:#f1f5f9;line-height:1.1;letter-spacing:-0.02em;margin:0;background:linear-gradient(135deg,#f1f5f9 40%,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-family:'Inter',sans-serif">${esc(slide.title)}</h1></div>${barHtml()}${progressHtml(n, total)}</body></html>`
}

function longDeepDive(slide: SlideInput, n: number, total: number): string {
  const items = resolveVisual(slide).slice(0, 3)
  const icon = slide.icon || "🔍"
  const paragraphCards = items.map(item =>
    `<div style="display:flex;align-items:flex-start;gap:14px;padding:14px 18px;border-left:3px solid rgba(59,130,246,0.4)"><span style="font-size:22px;flex-shrink:0;margin-top:2px">${item.icon}</span><span style="font-size:20px;color:#cbd5e1;font-weight:500;line-height:1.5;font-family:'Inter',sans-serif">${esc(item.label)}</span></div>`
  ).join("")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1280px;height:720px;background:${BG_COLOR};display:flex;flex-direction:column;padding:46px 70px;font-family:'Inter',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(60)}"></div><div style="${glowCss("bottom:-80px", "right:-80px", 350, 0.06)}"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;position:relative;z-index:1"><span style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:#3b82f6">js17.dev</span><span style="font-size:12px;color:#334155;font-family:'JetBrains Mono',monospace">${n} / ${total}</span></div><div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;position:relative;z-index:1"><span style="font-size:40px">${icon}</span><h1 style="font-size:${slide.title.length > 40 ? 28 : 34}px;font-weight:800;color:#f1f5f9;line-height:1.2;letter-spacing:-0.01em;margin:0;font-family:'Inter',sans-serif">${esc(slide.title)}</h1></div><div style="flex:1;display:flex;flex-direction:column;gap:8px;position:relative;z-index:1">${paragraphCards}</div>${barHtml()}${progressHtml(n, total)}</body></html>`
}

function longComparison(slide: SlideInput, n: number, total: number): string {
  const icon = slide.icon || "⚖️"
  const all = resolveVisual(slide)
  const half = Math.ceil(all.length / 2)
  const colA = slide.columnA ?? { heading: "Before", items: all.slice(0, half) }
  const colB = slide.columnB ?? { heading: "After", items: all.slice(half) }

  const colACards = (colA.items || []).slice(0, 4).map(item =>
    `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.12);border-radius:10px;margin-bottom:6px"><span style="font-size:18px;flex-shrink:0">${item.icon}</span><span style="font-size:16px;color:#cbd5e1;font-weight:500;font-family:'Inter',sans-serif;line-height:1.4">${esc(item.label)}</span></div>`
  ).join("")

  const colBCards = (colB.items || []).slice(0, 4).map(item =>
    `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.12);border-radius:10px;margin-bottom:6px"><span style="font-size:18px;flex-shrink:0">${item.icon}</span><span style="font-size:16px;color:#cbd5e1;font-weight:500;font-family:'Inter',sans-serif;line-height:1.4">${esc(item.label)}</span></div>`
  ).join("")

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}</head><body style="width:1280px;height:720px;background:${BG_COLOR};display:flex;flex-direction:column;padding:46px 70px;font-family:'Inter',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(60)}"></div><div style="${glowCss("top:-80px", "left:-80px", 350, 0.06)}"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;position:relative;z-index:1"><span style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:#3b82f6">js17.dev</span><span style="font-size:12px;color:#334155;font-family:'JetBrains Mono',monospace">${n} / ${total}</span></div><div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;position:relative;z-index:1"><span style="font-size:36px">${icon}</span><h1 style="font-size:${slide.title.length > 40 ? 28 : 34}px;font-weight:800;color:#f1f5f9;line-height:1.2;margin:0;font-family:'Inter',sans-serif">${esc(slide.title)}</h1></div><div style="display:grid;grid-template-columns:1fr 2px 1fr;gap:20px;flex:1;position:relative;z-index:1"><div><div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ef4444;margin-bottom:10px;font-family:'JetBrains Mono',monospace">${esc(colA.heading)}</div>${colACards}</div><div style="background:rgba(59,130,246,0.12);border-radius:2px"></div><div><div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#22c55e;margin-bottom:10px;font-family:'JetBrains Mono',monospace">${esc(colB.heading)}</div>${colBCards}</div></div>${barHtml()}${progressHtml(n, total)}</body></html>`
}

function longCodeExample(slide: SlideInput, n: number, total: number): string {
  const icon = slide.icon || "💻"
  const codeLines = (slide.codeLines || []).slice(0, 8)
  const codeHtml = codeLines.map(l => esc(l)).join("\n")
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINKS}${CODE_LINKS}</head><body style="width:1280px;height:720px;background:${BG_COLOR};display:flex;flex-direction:column;padding:40px 70px;font-family:'Inter',sans-serif;position:relative;overflow:hidden"><div style="${gridCss(60)}"></div><div style="${glowCss("bottom:-80px", "right:-80px", 400, 0.06)}"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;position:relative;z-index:1"><span style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:#3b82f6">js17.dev</span><span style="font-size:12px;color:#334155;font-family:'JetBrains Mono',monospace">${n} / ${total}</span></div><div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;position:relative;z-index:1"><span style="font-size:32px">${icon}</span><h1 style="font-size:${slide.title.length > 40 ? 26 : 32}px;font-weight:800;color:#f1f5f9;line-height:1.2;margin:0;font-family:'Inter',sans-serif">${esc(slide.title)}</h1></div><div style="flex:1;position:relative;z-index:1;overflow:hidden"><pre class="language-typescript" style="background:#0a0f1e;border-radius:8px;padding:20px;font-size:14px;margin:0;height:100%;overflow:hidden;font-family:'JetBrains Mono',monospace"><code class="language-typescript">${codeHtml}</code></pre></div>${barHtml()}${progressHtml(n, total)}</body></html>`
}

/* ─── Slide Router ────────────────────────────────────────────────────────── */

function buildSlideHtml(slide: SlideInput, n: number, total: number, isShort: boolean): string {
  const type = slide.type || "insight"
  if (isShort) {
    switch (type) {
      case "hook": case "intro": return shortHook(slide, n, total)
      case "stats": return shortStats(slide, n, total)
      case "cta": return shortCta(slide, n, total)
      case "code_example": return shortCodeBlock(slide, n, total)
      default: return shortInsight(slide, n, total)
    }
  } else {
    switch (type) {
      case "hook": case "context": return longHook(slide, n, total)
      case "chapter_divider": return longChapterDivider(slide, n, total)
      case "deep_dive": return longDeepDive(slide, n, total)
      case "comparison": return longComparison(slide, n, total)
      case "code_example": return longCodeExample(slide, n, total)
      case "stats": return longStats(slide, n, total)
      case "cta": return longCta(slide, n, total)
      default: return longInsight(slide, n, total)
    }
  }
}

/* ─── Effects & Transitions ─────────────────────────────────────────────── */

function getEffect(type: string | undefined, index: number): string {
  if (type === "hook" || type === "intro" || type === "context") return "zoomIn"
  if (type === "cta") return "zoomIn"
  if (type === "stats") return "zoomInSlow"
  if (type === "chapter_divider") return "zoomIn"
  return index % 2 === 0 ? "slideRight" : "slideLeft"
}

function getTransition(
  type: string | undefined,
  index: number,
  total: number,
  isShort: boolean
): Record<string, string> {
  const isFirst = index === 0
  const isLast = index === total - 1

  if (isFirst) {
    return isShort ? { out: "wipeLeft" } : { out: "dissolve" }
  }
  if (isLast) {
    return isShort ? { in: "dissolve" } : { in: "dissolve" }
  }

  if (!isShort) {
    switch (type) {
      case "chapter_divider": return { in: "wipeLeft", out: "wipeLeft" }
      case "stats": return { in: "wipeTop", out: "wipeBottom" }
      case "comparison": return { in: "carouselLeft", out: "carouselRight" }
      case "code_example": return { in: "zoom", out: "dissolve" }
      case "hook": case "context": return { out: "dissolve" }
      case "cta": return { in: "dissolve" }
    }
    return index % 2 === 0 ? { in: "carouselLeft" } : { in: "carouselRight" }
  } else {
    switch (type) {
      case "stats": return { in: "zoom", out: "fade" }
      case "comparison": return { in: "carouselLeft" }
      case "code_example": return { in: "carouselRight" }
      case "cta": return { in: "dissolve" }
    }
    return index % 2 === 0 ? { in: "carouselLeft" } : { in: "carouselRight" }
  }
}

/* ─── Route Handler ──────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const {
    slides,
    audioUrl,
    audioSlides: rawAudioSlides,
    totalDuration,
    videoFormat = "long",
    backgroundImages = [],
  } = body as {
    slides: SlideInput[]
    audioUrl?: string
    audioSlides?: AudioSlide[]
    totalDuration: number
    videoFormat: "short" | "long"
    backgroundImages?: string[]
  }

  const isShort = videoFormat === "short"
  const width = isShort ? 1080 : 1280
  const height = isShort ? 1920 : 720

  // Inject background images on hook and cta slides
  let imgIdx = 0
  const processedSlides = slides.map(slide => {
    const s = { ...slide }
    if ((s.type === "hook" || s.type === "cta") && backgroundImages[imgIdx]) {
      s.backgroundImageUrl = backgroundImages[imgIdx++]
    }
    return s
  })

  let currentTime = 0
  const slideClips: unknown[] = []
  const audioClips: unknown[] = []

  for (let i = 0; i < processedSlides.length; i++) {
    const slide = processedSlides[i]
    const audioSlide = rawAudioSlides?.find(a => a.slideIndex === i)
    const slideDuration = audioSlide?.durationSeconds ?? slide.estimatedDuration

    const html = buildSlideHtml(slide, i + 1, processedSlides.length, isShort)
    slideClips.push({
      asset: { type: "html", html, width, height, background: "transparent" },
      start: currentTime,
      length: slideDuration,
      effect: getEffect(slide.type, i),
      transition: getTransition(slide.type, i, processedSlides.length, isShort),
    })

    if (audioSlide) {
      audioClips.push({
        asset: { type: "audio", src: audioSlide.url, volume: 1.3 },
        start: currentTime,
        length: slideDuration,
      })
    }

    currentTime += slideDuration
  }

  // Backward compat: single audioUrl
  if (audioUrl && audioClips.length === 0) {
    audioClips.push({
      asset: { type: "audio", src: audioUrl, volume: 1 },
      start: 0,
      length: totalDuration,
    })
  }

  const timeline = {
    background: BG_COLOR,
    tracks: [
      { clips: slideClips },
      ...(audioClips.length > 0 ? [{ clips: audioClips }] : []),
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
