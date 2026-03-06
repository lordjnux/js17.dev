"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/* ─── Hooks ──────────────────────────────────────────────────── */

function useAnimatedValue(target: number, active: boolean, duration = 2000) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let cancelled = false
    const start = performance.now()
    const step = (now: number) => {
      if (cancelled) return
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
    return () => { cancelled = true }
  }, [active, target, duration])
  return value
}

function useScrollReveal(threshold = 0.1) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { visible, ref }
}

/* ─── Dashboard Showcase ─────────────────────────────────────── */

export function DashboardShowcase() {
  const { visible, ref } = useScrollReveal()
  const videos = useAnimatedValue(3, visible)
  const shorts = useAnimatedValue(2, visible)
  const longs = useAnimatedValue(1, visible)
  const views = useAnimatedValue(33, visible, 2500)

  const stats = [
    { val: videos, label: "Total Videos", color: "red", icon: "🎬" },
    { val: shorts, label: "Shorts", color: "yellow", icon: "⚡" },
    { val: longs, label: "Long Videos", color: "blue", icon: "🎞" },
    { val: views, label: "Total Views", color: "green", icon: "👁" },
    { val: 0, label: "Total Likes", color: "purple", icon: "👍" },
    { val: 0, label: "Comments", color: "orange", icon: "💬" },
  ]

  const colorMap: Record<string, string> = {
    red: "border-red-500/30 text-red-400",
    yellow: "border-yellow-500/30 text-yellow-400",
    blue: "border-blue-500/30 text-blue-400",
    green: "border-green-500/30 text-green-400",
    purple: "border-purple-500/30 text-purple-400",
    orange: "border-orange-500/30 text-orange-400",
  }

  return (
    <div ref={ref} className="not-prose my-10">
      <div
        className={cn(
          "p-px rounded-2xl transition-all duration-1000",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        )}
        style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.5), rgba(168,85,247,0.5), rgba(239,68,68,0.5))" }}
      >
        <div className="rounded-2xl bg-[#0a0a1a] overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-white/40 font-mono ml-2">js17.dev/admin/youtube/metrics</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] text-green-400/70 font-mono">LIVE</span>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-red-500 text-lg">📊</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">YouTube Video Metrics</h3>
                <p className="text-[11px] text-white/40">Performance overview — real data, real time</p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border bg-white/[0.02] p-2.5 sm:p-3 text-center transition-all duration-700",
                    colorMap[s.color],
                    visible ? "opacity-100 scale-100" : "opacity-0 scale-90",
                  )}
                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                >
                  <div className="text-base sm:text-lg mb-0.5">{s.icon}</div>
                  <div className="text-lg sm:text-xl font-bold font-mono">{s.val}</div>
                  <div className="text-[9px] sm:text-[10px] mt-0.5 opacity-60">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Video panels */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div
                className={cn(
                  "rounded-xl border border-yellow-500/20 bg-yellow-500/[0.03] p-4 transition-all duration-700",
                  visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                )}
                style={{ transitionDelay: "900ms" }}
              >
                <h4 className="text-xs font-bold text-yellow-400 mb-3">⚡ Shorts (2)</h4>
                <div className="space-y-2">
                  {[
                    { slug: "from-portfolio-to-platform", views: 11 },
                    { slug: "architecture-omnipresence", views: 20 },
                  ].map((v) => (
                    <div key={v.slug} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 border border-white/5">
                      <span className="text-xs text-white/70 truncate">{v.slug}</span>
                      <span className="text-xs font-mono text-white/50 flex-shrink-0 ml-2">👁 {v.views}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={cn(
                  "rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-4 transition-all duration-700",
                  visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
                )}
                style={{ transitionDelay: "1000ms" }}
              >
                <h4 className="text-xs font-bold text-blue-400 mb-3">🎞 Long Videos (1)</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 border border-white/5">
                    <span className="text-xs text-white/70 truncate">architecture-omnipresence</span>
                    <span className="text-xs font-mono text-white/50 flex-shrink-0 ml-2">👁 2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table preview */}
            <div
              className={cn(
                "rounded-xl border border-white/5 overflow-hidden transition-all duration-700",
                visible ? "opacity-100" : "opacity-0",
              )}
              style={{ transitionDelay: "1200ms" }}
            >
              <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <h4 className="text-xs font-bold text-white">All Published Videos</h4>
                <p className="text-[10px] text-white/30">3 videos across 2 articles</p>
              </div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-white/5 text-white/30">
                    <th className="text-left px-4 py-2 font-medium">Article</th>
                    <th className="text-left px-4 py-2 font-medium">Format</th>
                    <th className="text-right px-4 py-2 font-medium">Views</th>
                    <th className="text-right px-4 py-2 font-medium hidden sm:table-cell">Published</th>
                  </tr>
                </thead>
                <tbody className="text-white/60">
                  {[
                    { slug: "from-portfolio-to-platform-reusable-en...", format: "Short", views: 11, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
                    { slug: "architecture-omnipresence-strategy", format: "Long", views: 2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                    { slug: "architecture-omnipresence-strategy", format: "Short", views: 20, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
                  ].map((row, i) => (
                    <tr key={i} className={cn("border-b border-white/[0.03] last:border-0", i % 2 === 1 && "bg-white/[0.01]")}>
                      <td className="px-4 py-2 font-mono truncate max-w-[160px]">{row.slug}</td>
                      <td className="px-4 py-2">
                        <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium border", row.color)}>
                          {row.format}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-bold">{row.views}</td>
                      <td className="px-4 py-2 text-right text-white/30 hidden sm:table-cell">Mar 6</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Pipeline Flow ──────────────────────────────────────────── */

export function PipelineFlow() {
  const { visible, ref } = useScrollReveal(0.2)

  const steps = [
    { icon: "📝", label: "Write", desc: "MDX Article", color: "blue" },
    { icon: "🧠", label: "Script", desc: "GPT-4o", color: "purple" },
    { icon: "🎙", label: "Narrate", desc: "OpenAI TTS", color: "green" },
    { icon: "🎬", label: "Render", desc: "Shotstack", color: "orange" },
    { icon: "📺", label: "Publish", desc: "YouTube", color: "red" },
  ]

  const nodeColors: Record<string, string> = {
    blue: "border-blue-500/40 bg-blue-500/10",
    purple: "border-purple-500/40 bg-purple-500/10",
    green: "border-green-500/40 bg-green-500/10",
    orange: "border-orange-500/40 bg-orange-500/10",
    red: "border-red-500/40 bg-red-500/10",
  }

  return (
    <div ref={ref} className="not-prose my-10">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-center justify-between relative px-4">
        {/* Animated connection line */}
        <div className="absolute top-8 left-[12%] right-[12%] h-0.5">
          <div
            className={cn("h-full origin-left transition-transform", visible ? "scale-x-100" : "scale-x-0")}
            style={{
              background: "linear-gradient(to right, #3b82f6, #a855f7, #22c55e, #f97316, #ef4444)",
              transitionDuration: "2s",
              transitionTimingFunction: "ease-out",
            }}
          />
        </div>

        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "relative z-10 flex flex-col items-center text-center transition-all duration-700",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
            style={{ transitionDelay: `${i * 300}ms` }}
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm",
              nodeColors[step.color],
            )}>
              {step.icon}
            </div>
            <span className="text-xs font-bold mt-2">{step.label}</span>
            <span className="text-[10px] text-muted-foreground">{step.desc}</span>
          </div>
        ))}
      </div>

      {/* Mobile: vertical flow */}
      <div className="md:hidden space-y-1">
        {steps.map((step, i) => (
          <div key={i}>
            <div
              className={cn(
                "rounded-xl border p-3 flex items-center gap-3 transition-all duration-500",
                nodeColors[step.color],
                visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
              )}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <span className="text-xl flex-shrink-0">{step.icon}</span>
              <div>
                <span className="text-sm font-bold">{step.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{step.desc}</span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-0.5">
                <span className="text-muted-foreground/30 text-xs">▼</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Impact Grid & Metric ───────────────────────────────────── */

export function ImpactGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-10">
      {children}
    </div>
  )
}

export function ImpactMetric({
  value,
  prefix = "",
  suffix = "",
  label,
  comparison,
  color = "blue",
}: {
  value: number
  prefix?: string
  suffix?: string
  label: string
  comparison: string
  color?: "blue" | "green" | "red" | "purple" | "orange"
}) {
  const { visible, ref } = useScrollReveal(0.3)
  const count = useAnimatedValue(value, visible, 2500)

  const colorMap: Record<string, { border: string; text: string; glow: string }> = {
    blue: { border: "border-blue-500/40", text: "text-blue-400", glow: "shadow-blue-500/10" },
    green: { border: "border-green-500/40", text: "text-green-400", glow: "shadow-green-500/10" },
    red: { border: "border-red-500/40", text: "text-red-400", glow: "shadow-red-500/10" },
    purple: { border: "border-purple-500/40", text: "text-purple-400", glow: "shadow-purple-500/10" },
    orange: { border: "border-orange-500/40", text: "text-orange-400", glow: "shadow-orange-500/10" },
  }
  const c = colorMap[color]

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border bg-card p-6 sm:p-8 text-center shadow-lg transition-all duration-700",
        c.border, c.glow,
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
      )}
    >
      <div className={cn("text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight", c.text)}>
        {prefix}{count}{suffix}
      </div>
      <div className="text-sm font-semibold mt-2">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{comparison}</div>
    </div>
  )
}
