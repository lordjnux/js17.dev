"use client"

import { useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"

// Works with both "#RRGGBB" hex and "rgba(...)" strings
function withAlpha(color: string, alpha: number): string {
  if (color.startsWith("rgba")) {
    return color.replace(/[\d.]+\)$/, `${alpha})`)
  }
  return `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Car {
  col: number
  row: number
  dir: "h" | "v"
  progress: number  // 0..1 along current segment
  speed: number
  color: string
}

interface SpecialNode {
  col: number
  row: number
  type: "hazard" | "voice" | "fleet" | "auto"
  color: string
  pulse: number  // 0..1 current glow phase
  pulseSpeed: number
}

interface ConnectionPulse {
  x1: number; y1: number
  x2: number; y2: number
  progress: number  // 0..1
  color: string
}

// ─── Grid Canvas ─────────────────────────────────────────────────────────────
function GridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const COLS = 9
    const ROWS = 5
    let CELL_W = 0
    let CELL_H = 0
    let PAD_X = 0
    let PAD_Y = 0
    let raf: number

    // Special nodes
    const NODES: SpecialNode[] = [
      { col: 1, row: 1, type: "voice",  color: "#00D4FF",              pulse: 0,   pulseSpeed: 0.025 },
      { col: 3, row: 0, type: "hazard", color: "#f5a623",              pulse: 0.4, pulseSpeed: 0.035 },
      { col: 7, row: 1, type: "hazard", color: "#f5a623",              pulse: 0.7, pulseSpeed: 0.03  },
      { col: 5, row: 2, type: "auto",   color: "#00D4FF",              pulse: 0.2, pulseSpeed: 0.02  },
      { col: 2, row: 4, type: "fleet",  color: "#16c784",              pulse: 0.6, pulseSpeed: 0.028 },
      { col: 8, row: 3, type: "hazard", color: "#f5a623",              pulse: 0.1, pulseSpeed: 0.04  },
      { col: 6, row: 4, type: "fleet",  color: "#16c784",              pulse: 0.9, pulseSpeed: 0.022 },
      { col: 4, row: 1, type: "auto",   color: "#16c784",              pulse: 0.5, pulseSpeed: 0.018 },
      // AAOS + AR Glasses — faint spectral nodes (future)
      { col: 8, row: 0, type: "voice",  color: "rgba(232,244,248,0.4)", pulse: 0.3, pulseSpeed: 0.012 },
      { col: 0, row: 3, type: "fleet",  color: "rgba(232,244,248,0.3)", pulse: 0.8, pulseSpeed: 0.010 },
    ]

    // Cars
    const CAR_COUNT = 28
    const cars: Car[] = []
    for (let i = 0; i < CAR_COUNT; i++) {
      const dir = Math.random() > 0.5 ? "h" : "v"
      if (dir === "h") {
        cars.push({
          col: Math.floor(Math.random() * (COLS - 1)),
          row: Math.floor(Math.random() * (ROWS + 1)),
          dir, progress: Math.random(),
          speed: 0.003 + Math.random() * 0.007,
          color: Math.random() > 0.85 ? "#00D4FF" : "rgba(232,244,248,0.65)",
        })
      } else {
        cars.push({
          col: Math.floor(Math.random() * (COLS + 1)),
          row: Math.floor(Math.random() * (ROWS - 1)),
          dir, progress: Math.random(),
          speed: 0.002 + Math.random() * 0.006,
          color: Math.random() > 0.85 ? "#00D4FF" : "rgba(232,244,248,0.65)",
        })
      }
    }

    // Connection pulses
    const pulses: ConnectionPulse[] = []
    let lastPulseTime = 0

    const nodePos = (n: SpecialNode) => ({
      x: PAD_X + n.col * CELL_W,
      y: PAD_Y + n.row * CELL_H,
    })

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const W = canvas.width
      const H = canvas.height
      PAD_X = W * 0.07
      PAD_Y = H * 0.12
      CELL_W = (W - PAD_X * 2) / COLS
      CELL_H = (H - PAD_Y * 2) / ROWS
    }
    resize()
    window.addEventListener("resize", resize)

    const draw = (ts: number) => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // ── Grid lines ──
      ctx.lineWidth = 1
      for (let r = 0; r <= ROWS; r++) {
        const y = PAD_Y + r * CELL_H
        ctx.beginPath()
        ctx.moveTo(PAD_X, y)
        ctx.lineTo(PAD_X + COLS * CELL_W, y)
        ctx.strokeStyle = "rgba(0,212,255,0.07)"
        ctx.stroke()
      }
      for (let c = 0; c <= COLS; c++) {
        const x = PAD_X + c * CELL_W
        ctx.beginPath()
        ctx.moveTo(x, PAD_Y)
        ctx.lineTo(x, PAD_Y + ROWS * CELL_H)
        ctx.strokeStyle = "rgba(0,212,255,0.07)"
        ctx.stroke()
      }

      // ── Normal intersection dots ──
      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          const x = PAD_X + c * CELL_W
          const y = PAD_Y + r * CELL_H
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(0,212,255,0.14)"
          ctx.fill()
        }
      }

      // ── Connection pulses ──
      if (ts - lastPulseTime > 1800) {
        lastPulseTime = ts
        const a = NODES[Math.floor(Math.random() * NODES.length)]
        const b = NODES[Math.floor(Math.random() * NODES.length)]
        if (a !== b) {
          const ap = nodePos(a), bp = nodePos(b)
          pulses.push({ x1: ap.x, y1: ap.y, x2: bp.x, y2: bp.y, progress: 0, color: a.color })
        }
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.progress += 0.018
        if (p.progress >= 1) { pulses.splice(i, 1); continue }

        const px = p.x1 + (p.x2 - p.x1) * p.progress
        const py = p.y1 + (p.y2 - p.y1) * p.progress

        // Trail
        const trailGrad = ctx.createLinearGradient(p.x1, p.y1, px, py)
        trailGrad.addColorStop(0, "transparent")
        trailGrad.addColorStop(1, withAlpha(p.color, 0.33))
        ctx.beginPath()
        ctx.moveTo(p.x1, p.y1)
        ctx.lineTo(px, py)
        ctx.strokeStyle = trailGrad
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Pulse dot
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // ── Cars ──
      for (const car of cars) {
        car.progress += car.speed
        if (car.progress >= 1) car.progress = 0

        let x: number, y: number
        if (car.dir === "h") {
          x = PAD_X + (car.col + car.progress) * CELL_W
          y = PAD_Y + car.row * CELL_H
        } else {
          x = PAD_X + car.col * CELL_W
          y = PAD_Y + (car.row + car.progress) * CELL_H
        }

        if (car.color === "#00D4FF") {
          ctx.shadowColor = "#00D4FF"
          ctx.shadowBlur = 6
        }
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = car.color
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // ── Special nodes ──
      for (const node of NODES) {
        node.pulse = (node.pulse + node.pulseSpeed) % 1
        const px = PAD_X + node.col * CELL_W
        const py = PAD_Y + node.row * CELL_H
        const glowR = 16 + Math.sin(node.pulse * Math.PI * 2) * 6

        // Outer glow ring
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR)
        glow.addColorStop(0, withAlpha(node.color, 0.27))
        glow.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(px, py, glowR, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Inner dot
        ctx.beginPath()
        ctx.arc(px, py, 5, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.shadowColor = node.color
        ctx.shadowBlur = 12
        ctx.fill()
        ctx.shadowBlur = 0

        // Center bright
        ctx.beginPath()
        ctx.arc(px, py, 2, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="h-[420px] w-full md:h-[500px]"
    />
  )
}

// ─── Zone label overlay ───────────────────────────────────────────────────────
const ZONES = [
  { label: "Voice AI",    sub: "Hey Jack — always listening",        top: "15%", left: "6%",  color: "#00D4FF" },
  { label: "Community",   sub: "Real-time hazard network",            top: "8%",  left: "55%", color: "#f5a623" },
  { label: "Navigation",  sub: "Turn-by-turn, spoken aloud",          top: "60%", left: "6%",  color: "#16c784" },
  { label: "Fleet",       sub: "Multi-vehicle intelligence",          top: "72%", left: "58%", color: "#16c784" },
  { label: "AAOS",        sub: "Android Automotive OS · coming",      top: "6%",  left: "82%", color: "rgba(232,244,248,0.35)" },
  { label: "AR Glasses",  sub: "Spatial HUD · vision",               top: "65%", left: "0%",  color: "rgba(232,244,248,0.25)" },
]

// ─── Main section ─────────────────────────────────────────────────────────────
export function JackNeuralGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })

  return (
    <section
      ref={ref}
      className="overflow-hidden px-0 py-24 md:py-32"
      style={{ background: "#0a0a14" }}
    >
      {/* Header */}
      <div className="mb-12 px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#00D4FF" }}
        >
          The Jack Network
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
          style={{ color: "#e8f4f8" }}
        >
          One intelligence.
          <br />
          <span style={{ color: "rgba(0,212,255,0.85)" }}>Every road.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 text-sm"
          style={{ color: "#6b8fa8" }}
        >
          Every dot is a driver. Every pulse is a conversation. This is Jack&apos;s world.
        </motion.p>
      </div>

      {/* Canvas + zone labels */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative mx-auto"
        style={{ borderTop: "1px solid rgba(0,212,255,0.06)", borderBottom: "1px solid rgba(0,212,255,0.06)" }}
      >
        <GridCanvas />

        {/* Zone labels — positioned over canvas */}
        {ZONES.map(z => (
          <div
            key={z.label}
            className="pointer-events-none absolute"
            style={{ top: z.top, left: z.left }}
          >
            <span
              className="block text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: z.color }}
            >
              {z.label}
            </span>
            <span className="block text-[9px] mt-0.5" style={{ color: "rgba(107,143,168,0.6)" }}>
              {z.sub}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Platform badges below grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-3 px-6"
      >
        {[
          { l: "Android",       a: true  },
          { l: "Android Auto",  a: true  },
          { l: "AAOS",          a: true  },
          { l: "Wearables",     a: false },
          { l: "Fleet",         a: false },
          { l: "iPhone",        a: false },
        ].map(p => (
          <span
            key={p.l}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
            style={p.a
              ? { background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.3)", color: "#00D4FF" }
              : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(107,143,168,0.45)" }
            }
          >
            {p.l}
            {!p.a && (
              <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase" style={{ background: "rgba(245,166,35,0.12)", color: "#f5a623" }}>
                soon
              </span>
            )}
          </span>
        ))}
      </motion.div>
    </section>
  )
}
