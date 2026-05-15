"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

// ─── Animated Road Canvas ────────────────────────────────────────────────────
function RoadCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf: number
    let dashOffset = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      const VPX = W * 0.5
      const VPY = H * 0.43

      ctx.clearRect(0, 0, W, H)

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, VPY)
      sky.addColorStop(0, "#020408")
      sky.addColorStop(1, "#060e18")
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, VPY + 2)

      // City glow on horizon
      const glow = ctx.createRadialGradient(VPX, VPY, 0, VPX, VPY, W * 0.55)
      glow.addColorStop(0, "rgba(0,212,255,0.14)")
      glow.addColorStop(0.35, "rgba(0,140,200,0.06)")
      glow.addColorStop(1, "transparent")
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.ellipse(VPX, VPY, W * 0.55, H * 0.35, 0, 0, Math.PI * 2)
      ctx.fill()

      // Road surface
      const roadLeft = VPX - W * 0.45
      const roadRight = VPX + W * 0.45
      const road = ctx.createLinearGradient(0, VPY, 0, H)
      road.addColorStop(0, "#080c12")
      road.addColorStop(0.5, "#0a0e14")
      road.addColorStop(1, "#060810")
      ctx.beginPath()
      ctx.moveTo(VPX, VPY)
      ctx.lineTo(roadLeft, H)
      ctx.lineTo(roadRight, H)
      ctx.closePath()
      ctx.fillStyle = road
      ctx.fill()

      // Road edge lines
      const edgeLine = (bx: number) => {
        const g = ctx.createLinearGradient(VPX, VPY, bx, H)
        g.addColorStop(0, "rgba(255,255,255,0)")
        g.addColorStop(0.3, "rgba(255,255,255,0.08)")
        g.addColorStop(1, "rgba(255,255,255,0.28)")
        ctx.beginPath()
        ctx.moveTo(VPX, VPY)
        ctx.lineTo(bx, H)
        ctx.strokeStyle = g
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      edgeLine(roadLeft)
      edgeLine(roadRight)

      // Inner lane lines (dashed feel via low opacity solid)
      const laneLine = (bx: number) => {
        const g = ctx.createLinearGradient(VPX, VPY, bx, H)
        g.addColorStop(0, "transparent")
        g.addColorStop(0.4, "rgba(255,255,255,0.04)")
        g.addColorStop(1, "rgba(255,255,255,0.09)")
        ctx.beginPath()
        ctx.moveTo(VPX, VPY)
        ctx.lineTo(bx, H)
        ctx.strokeStyle = g
        ctx.lineWidth = 1
        ctx.stroke()
      }
      laneLine(VPX - W * 0.15)
      laneLine(VPX + W * 0.15)

      // Animated center dashes — perspective correct
      dashOffset = (dashOffset + 2.8) % 100
      const NUM = 18
      for (let i = 0; i < NUM; i++) {
        const rawT = ((i / NUM) + dashOffset / 100) % 1
        const t = Math.pow(rawT, 1.7)   // perspective acceleration
        if (t < 0.015) continue

        const y = VPY + (H - VPY) * t
        const dh = Math.max(4, (H - VPY) * 0.065 * t)
        const dw = 2.5 + t * 12
        const alpha = Math.min(t * 2.2, 0.85)

        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.75})`
        ctx.fillRect(VPX - dw / 2, y, dw, dh)
      }

      // Wet-road cyan reflection strip
      const refl = ctx.createLinearGradient(0, VPY + (H - VPY) * 0.25, 0, H)
      refl.addColorStop(0, "transparent")
      refl.addColorStop(1, "rgba(0,212,255,0.05)")
      ctx.beginPath()
      ctx.moveTo(VPX, VPY)
      ctx.lineTo(VPX - W * 0.09, H)
      ctx.lineTo(VPX + W * 0.09, H)
      ctx.closePath()
      ctx.fillStyle = refl
      ctx.fill()

      // Vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.9)
      vig.addColorStop(0, "transparent")
      vig.addColorStop(1, "rgba(0,0,0,0.72)")
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />
}

// ─── Waveform Bars (animates like a voice indicator) ─────────────────────────
function VoiceWave() {
  const [heights, setHeights] = useState([40, 70, 90, 55, 75, 45, 60])

  useEffect(() => {
    const id = setInterval(() => {
      setHeights(h => h.map(() => 20 + Math.random() * 80))
    }, 160)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-[3px]" style={{ height: 28 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: `${h}%`,
            background: "#00D4FF",
            borderRadius: 2,
            transition: "height 0.15s ease",
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  )
}

// ─── Glass HUD panel ─────────────────────────────────────────────────────────
function HUDPanel({
  children,
  className = "",
  accent = "#00D4FF",
}: {
  children: React.ReactNode
  className?: string
  accent?: string
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 ${className}`}
      style={{
        background: "rgba(4,10,18,0.82)",
        border: `1px solid ${accent}44`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {children}
    </div>
  )
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
export function JackHeroRoad() {
  return (
    <section
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ background: "#020408" }}
    >
      {/* Road canvas */}
      <RoadCanvas />

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.018) 2px,rgba(0,0,0,0.018) 4px)",
        }}
      />

      {/* ── TOP HUD BAR ── */}
      <div className="relative z-10 flex items-start justify-between px-6 pt-6 sm:px-10">
        {/* Navigation panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 1.4 }}
        >
          <HUDPanel>
            <div className="mb-1 flex items-center gap-2">
              <div
                className="flex h-5 w-5 items-center justify-center rounded"
                style={{ background: "rgba(0,212,255,0.12)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
                Navigation
              </span>
            </div>
            <p className="text-xs font-semibold" style={{ color: "#e8f4f8" }}>Keep right in 200m</p>
            <p className="text-[10px]" style={{ color: "#6b8fa8" }}>via Autopista Norte · 14 min</p>
          </HUDPanel>
        </motion.div>

        {/* Center: Jack badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col items-center gap-2"
        >
          <Image src="/jack/icon-assistant.svg" alt="Jack" width={52} height={52}
            style={{ filter: "drop-shadow(0 0 16px rgba(0,212,255,0.5))" }}
          />
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00D4FF" }}
          >
            v0.10 · Live
          </span>
        </motion.div>

        {/* Voice indicator */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 1.6 }}
        >
          <HUDPanel>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
              Jack · Listening
            </p>
            <VoiceWave />
          </HUDPanel>
        </motion.div>
      </div>

      {/* ── BOTTOM CONTENT ── */}
      <div className="relative z-10 mt-auto px-6 pb-20 text-center sm:px-10">

        {/* Hazard alert — left aligned */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
          className="mb-10 flex justify-center"
        >
          <HUDPanel accent="#f5a623" className="flex items-center gap-3">
            <span
              className="relative flex h-2.5 w-2.5 flex-shrink-0"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#f5a623" }} />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: "#f5a623" }} />
            </span>
            <span className="text-xs font-bold tracking-wide" style={{ color: "#f5a623" }}>HAZARD</span>
            <span className="text-xs" style={{ color: "#6b8fa8" }}>300m ahead · Police reported · 4 min ago</span>
          </HUDPanel>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mx-auto max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          style={{ color: "#e8f4f8" }}
        >
          The AI that was always
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #00D4FF, #7de8ff 60%, #00D4FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            missing from your car.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mx-auto mt-6 max-w-lg text-base sm:text-lg"
          style={{ color: "#6b8fa8", lineHeight: 1.7 }}
        >
          Voice-first. Context-aware. Always on.
          <br />
          Zero screen taps from start to finish.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="#waitlist"
            className="group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold tracking-wide transition-all duration-200"
            style={{
              background: "#00D4FF",
              color: "#050505",
              boxShadow: "0 0 28px rgba(0,212,255,0.4)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 48px rgba(0,212,255,0.6)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 28px rgba(0,212,255,0.4)" }}
          >
            Join the Waitlist
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <Link
            href="#waitlist"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold tracking-wide transition-all duration-200"
            style={{ border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF", background: "rgba(0,212,255,0.05)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download APK
          </Link>

          <div className="relative">
            <button
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold tracking-wide opacity-35"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#6b8fa8", background: "transparent" }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76A2 2 0 014.95 24c.42 0 .83-.08 1.2-.27l13.03-7.15a2 2 0 000-3.16L6.15.47A2 2 0 003 2.25v19.5c0 .73.39 1.38.97 1.73L4 23.76z" />
              </svg>
              Google Play
            </button>
            <span
              className="absolute -top-2 -right-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: "#f5a623", color: "#050505" }}
            >
              Soon
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
