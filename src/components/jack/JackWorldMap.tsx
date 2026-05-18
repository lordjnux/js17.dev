"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ────────────────────────────────────────────────────────────────────
interface CityDef {
  name: string
  country: string
  lat: number
  lng: number
}

interface WorldPulse {
  from: CityDef
  to: CityDef
  progress: number
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CITIES: CityDef[] = [
  { name: "Bogotá",   country: "Colombia", lat: 4.7,  lng: -74.1 },
  { name: "New York", country: "USA",      lat: 40.7, lng: -74.0 },
  { name: "Madrid",   country: "Spain",    lat: 40.4, lng:  -3.7 },
  { name: "Paris",    country: "France",   lat: 48.9, lng:   2.3 },
  { name: "Rome",     country: "Italy",    lat: 41.9, lng:  12.5 },
  { name: "Oslo",     country: "Norway",   lat: 59.9, lng:  10.7 },
  { name: "Berlin",   country: "Germany",  lat: 52.5, lng:  13.4 },
  { name: "Shanghai", country: "China",    lat: 31.2, lng: 121.5 },
  { name: "Tokyo",    country: "Japan",    lat: 35.7, lng: 139.7 },
  { name: "Mumbai",   country: "India",    lat: 19.1, lng:  72.9 },
]

// Simplified continent outlines [lng, lat]
const CONTINENTS: [number, number][][] = [
  // North America
  [[-167,68],[-140,72],[-95,74],[-80,72],[-68,65],[-52,47],[-67,44],[-76,34],[-80,26],[-87,20],[-83,9],[-77,8],[-60,8],[-52,10],[-62,18],[-97,22],[-117,33],[-124,48],[-130,55],[-165,57]],
  // South America
  [[-80,12],[-62,11],[-53,5],[-37,-7],[-36,-15],[-40,-22],[-48,-28],[-53,-33],[-65,-55],[-70,-53],[-73,-43],[-75,-38],[-73,-28],[-70,-18],[-75,-10],[-78,0],[-78,5],[-76,8]],
  // Europe
  [[-10,36],[-6,36],[28,36],[35,38],[40,42],[32,47],[30,52],[28,58],[25,65],[15,69],[5,62],[-2,58],[-5,48],[-10,44],[-9,38]],
  // Africa
  [[-18,37],[10,37],[35,34],[43,22],[44,12],[42,2],[42,-5],[38,-12],[35,-25],[28,-35],[18,-35],[14,-27],[10,-18],[8,-5],[0,5],[-8,5],[-17,14],[-18,22]],
  // Asia
  [[25,72],[50,74],[70,73],[95,72],[120,73],[140,72],[145,55],[140,40],[135,35],[125,25],[110,20],[102,12],[100,5],[104,-5],[115,-8],[130,-5],[145,5],[143,12],[135,25],[129,32],[120,38],[115,42],[100,42],[80,52],[70,46],[60,40],[55,38],[38,37],[28,40],[25,42],[25,50]],
  // Australia
  [[114,-22],[117,-35],[130,-35],[138,-37],[145,-38],[150,-37],[153,-28],[145,-18],[137,-15],[130,-12],[118,-17]],
  // Greenland
  [[-52,83],[-20,83],[-18,76],[-25,68],[-50,68],[-58,75]],
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function project(lng: number, lat: number, W: number, H: number, scale: number, ox: number, oy: number): [number, number] {
  return [
    ((lng + 180) / 360) * W * scale + ox,
    ((90 - lat) / 180) * H * scale + oy,
  ]
}

function cityHash(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return Math.abs(h)
}

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

// ─── World Canvas ─────────────────────────────────────────────────────────────
function WorldCanvas({ onCityClick }: { onCityClick: (city: CityDef) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const scaleRef = useRef(1.0)
  const offsetRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const dragOriginRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
  const pulsesRef = useRef<WorldPulse[]>([])
  const ringPhasesRef = useRef<number[]>(CITIES.map((_, i) => i * 0.1))
  const onClickRef = useRef(onCityClick)
  onClickRef.current = onCityClick

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf: number
    let lastPulse = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      const sc = scaleRef.current
      const ox = offsetRef.current.x
      const oy = offsetRef.current.y
      const now = Date.now()

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = "#020408"
      ctx.fillRect(0, 0, W, H)

      // Lat/lng grid
      ctx.strokeStyle = "rgba(0,212,255,0.025)"
      ctx.lineWidth = 1
      for (let lat = -60; lat <= 90; lat += 30) {
        const [, y] = project(0, lat, W, H, sc, ox, oy)
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
      for (let lng = -180; lng <= 180; lng += 30) {
        const [x] = project(lng, 0, W, H, sc, ox, oy)
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }

      // Continent fills
      for (const cont of CONTINENTS) {
        ctx.beginPath()
        cont.forEach(([lng, lat], i) => {
          const [x, y] = project(lng, lat, W, H, sc, ox, oy)
          if (i === 0) { ctx.moveTo(x, y) } else { ctx.lineTo(x, y) }
        })
        ctx.closePath()
        ctx.fillStyle = "rgba(0,212,255,0.055)"
        ctx.fill()
        ctx.strokeStyle = "rgba(0,212,255,0.13)"
        ctx.lineWidth = 0.7
        ctx.stroke()
      }

      // Spawn city-to-city pulses
      if (now - lastPulse > 2500 && pulsesRef.current.length < 4) {
        const a = CITIES[Math.floor(Math.random() * CITIES.length)]
        const b = CITIES[Math.floor(Math.random() * CITIES.length)]
        if (a !== b) { pulsesRef.current.push({ from: a, to: b, progress: 0 }); lastPulse = now }
      }

      // Draw pulses
      pulsesRef.current = pulsesRef.current.filter(p => p.progress <= 1)
      for (const p of pulsesRef.current) {
        p.progress += 0.006
        const [x1, y1] = project(p.from.lng, p.from.lat, W, H, sc, ox, oy)
        const [x2, y2] = project(p.to.lng, p.to.lat, W, H, sc, ox, oy)
        const px = x1 + (x2 - x1) * p.progress
        const py = y1 + (y2 - y1) * p.progress

        const trail = ctx.createLinearGradient(x1, y1, px, py)
        trail.addColorStop(0, "transparent")
        trail.addColorStop(1, "rgba(0,212,255,0.38)")
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(px, py)
        ctx.strokeStyle = trail; ctx.lineWidth = 1.5; ctx.stroke()

        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fillStyle = "#00D4FF"; ctx.shadowColor = "#00D4FF"; ctx.shadowBlur = 8
        ctx.fill(); ctx.shadowBlur = 0
      }

      // City dots
      for (let i = 0; i < CITIES.length; i++) {
        const city = CITIES[i]
        const [cx, cy] = project(city.lng, city.lat, W, H, sc, ox, oy)

        // Pulse ring
        ringPhasesRef.current[i] = (ringPhasesRef.current[i] + 0.012) % 1
        const ph = ringPhasesRef.current[i]
        const ringR = 10 + ph * 20
        const ringA = (1 - ph) * 0.55
        ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,212,255,${ringA})`; ctx.lineWidth = 1; ctx.stroke()

        // Dot
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2)
        ctx.fillStyle = "#00D4FF"; ctx.shadowColor = "#00D4FF"; ctx.shadowBlur = 14
        ctx.fill(); ctx.shadowBlur = 0

        ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2)
        ctx.fillStyle = "#e8f4f8"; ctx.fill()

        // Labels
        ctx.textAlign = "center"
        ctx.font = "bold 8.5px monospace"
        ctx.fillStyle = "rgba(0,212,255,0.9)"
        ctx.fillText(city.name, cx, cy + 20)
        ctx.font = "7.5px monospace"
        ctx.fillStyle = "rgba(178,205,216,0.85)"
        ctx.fillText(city.country, cx, cy + 30)
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    // ── Interaction ──
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const oldSc = scaleRef.current
      const newSc = Math.max(0.65, Math.min(3.5, oldSc * (e.deltaY > 0 ? 0.9 : 1.1)))
      const ox = offsetRef.current.x; const oy = offsetRef.current.y
      offsetRef.current.x = e.offsetX - (e.offsetX - ox) * newSc / oldSc
      offsetRef.current.y = e.offsetY - (e.offsetY - oy) * newSc / oldSc
      scaleRef.current = newSc
    }

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = false
      dragOriginRef.current = { x: e.clientX, y: e.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y }
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!dragOriginRef.current.x && !dragOriginRef.current.y) return
      const dx = e.clientX - dragOriginRef.current.x
      const dy = e.clientY - dragOriginRef.current.y
      if (Math.abs(dx) + Math.abs(dy) > 3) isDraggingRef.current = true
      if (isDraggingRef.current) {
        offsetRef.current.x = dragOriginRef.current.ox + dx
        offsetRef.current.y = dragOriginRef.current.oy + dy
      }
    }
    const onMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) {
        const W = canvas.width; const H = canvas.height
        const sc = scaleRef.current; const ox = offsetRef.current.x; const oy = offsetRef.current.y
        for (const city of CITIES) {
          const [cx, cy] = project(city.lng, city.lat, W, H, sc, ox, oy)
          if (Math.hypot(e.offsetX - cx, e.offsetY - cy) < 18) { onClickRef.current(city); break }
        }
      }
      isDraggingRef.current = false
      dragOriginRef.current = { x: 0, y: 0, ox: 0, oy: 0 }
    }

    let touchStart: { x: number; y: number } | null = null
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart || e.touches.length !== 1) return
      offsetRef.current.x += e.touches[0].clientX - touchStart.x
      offsetRef.current.y += e.touches[0].clientY - touchStart.y
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return
      const dx = e.changedTouches[0].clientX - touchStart.x
      const dy = e.changedTouches[0].clientY - touchStart.y
      const wasTap = Math.abs(dx) + Math.abs(dy) < 6
      touchStart = null
      if (wasTap) {
        const W = canvas.width; const H = canvas.height
        const sc = scaleRef.current; const ox = offsetRef.current.x; const oy = offsetRef.current.y
        const rect = canvas.getBoundingClientRect()
        const tx = e.changedTouches[0].clientX - rect.left
        const ty = e.changedTouches[0].clientY - rect.top
        for (const city of CITIES) {
          const [cx, cy] = project(city.lng, city.lat, W, H, sc, ox, oy)
          if (Math.hypot(tx - cx, ty - cy) < 24) { onClickRef.current(city); break }
        }
      }
    }

    canvas.addEventListener("wheel", onWheel, { passive: false })
    canvas.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    canvas.addEventListener("touchstart", onTouchStart, { passive: true })
    canvas.addEventListener("touchmove", onTouchMove, { passive: true })
    canvas.addEventListener("touchend", onTouchEnd, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      canvas.removeEventListener("touchstart", onTouchStart)
      canvas.removeEventListener("touchmove", onTouchMove)
      canvas.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  return <canvas ref={ref} className="h-full w-full cursor-grab active:cursor-grabbing" />
}

// ─── City Canvas ──────────────────────────────────────────────────────────────
function CityCanvas({ city }: { city: CityDef }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const rng = seededRng(cityHash(city.name))
    const COLS = 14
    const ROWS = 9
    const spacingMod = 0.82 + rng() * 0.36

    type VType = "sedan" | "truck" | "moto"
    const vehicles: {
      col: number; row: number; dir: "h" | "v"
      progress: number; speed: number; type: VType
      jack: boolean; sigTimer: number; reversed: boolean
    }[] = []

    const spawn = (type: VType, count: number) => {
      const maxSpeed = type === "moto" ? 0.009 : type === "truck" ? 0.004 : 0.006
      const minSpeed = type === "moto" ? 0.004 : type === "truck" ? 0.0015 : 0.002
      for (let i = 0; i < count; i++) {
        const dir: "h" | "v" = rng() < 0.55 ? "h" : "v"
        vehicles.push({
          col: Math.floor(rng() * COLS),
          row: Math.floor(rng() * ROWS),
          dir,
          progress: rng(),
          speed: minSpeed + rng() * (maxSpeed - minSpeed),
          type,
          jack: rng() < 0.32,
          sigTimer: rng() * 2500,
          reversed: rng() < 0.4,
        })
      }
    }
    spawn("sedan", 20)
    spawn("truck", 8)
    spawn("moto", 10)

    // 2 hazard nodes seeded by city
    const hazards = [
      { col: 1 + Math.floor(rng() * (COLS - 2)), row: 1 + Math.floor(rng() * (ROWS - 2)), pulse: rng() },
      { col: 1 + Math.floor(rng() * (COLS - 2)), row: 1 + Math.floor(rng() * (ROWS - 2)), pulse: rng() * 0.5 },
    ]

    let lastTime = Date.now()

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      const PAD_X = W * 0.08
      const PAD_Y = H * 0.1
      const CELL_W = ((W - PAD_X * 2) / COLS) * spacingMod
      const CELL_H = ((H - PAD_Y * 2) / ROWS) * spacingMod
      const now = Date.now()
      const dt = now - lastTime
      lastTime = now

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = "#020408"
      ctx.fillRect(0, 0, W, H)

      // Grid streets
      for (let r = 0; r <= ROWS; r++) {
        const avenue = r % 3 === 0
        ctx.strokeStyle = avenue ? "rgba(0,212,255,0.16)" : "rgba(0,212,255,0.07)"
        ctx.lineWidth = avenue ? 2 : 1
        const y = PAD_Y + r * CELL_H
        ctx.beginPath(); ctx.moveTo(PAD_X, y); ctx.lineTo(PAD_X + COLS * CELL_W, y); ctx.stroke()
      }
      for (let c = 0; c <= COLS; c++) {
        const avenue = c % 3 === 0
        ctx.strokeStyle = avenue ? "rgba(0,212,255,0.16)" : "rgba(0,212,255,0.07)"
        ctx.lineWidth = avenue ? 2 : 1
        const x = PAD_X + c * CELL_W
        ctx.beginPath(); ctx.moveTo(x, PAD_Y); ctx.lineTo(x, PAD_Y + ROWS * CELL_H); ctx.stroke()
      }

      // Intersection dots
      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          ctx.beginPath()
          ctx.arc(PAD_X + c * CELL_W, PAD_Y + r * CELL_H, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(0,212,255,0.2)"; ctx.fill()
        }
      }

      // Hazard nodes
      for (const hz of hazards) {
        hz.pulse = (hz.pulse + 0.022) % 1
        const hx = PAD_X + hz.col * CELL_W
        const hy = PAD_Y + hz.row * CELL_H
        const gr = 14 + Math.sin(hz.pulse * Math.PI * 2) * 5
        const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, gr)
        hg.addColorStop(0, "rgba(245,166,35,0.32)"); hg.addColorStop(1, "transparent")
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, gr, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2)
        ctx.fillStyle = "#f5a623"; ctx.shadowColor = "#f5a623"; ctx.shadowBlur = 12
        ctx.fill(); ctx.shadowBlur = 0
        ctx.font = "bold 7px monospace"; ctx.fillStyle = "rgba(245,166,35,0.8)"; ctx.textAlign = "center"
        ctx.fillText("⚠ HAZARD", hx, hy - 13)
      }

      // Vehicles
      for (const v of vehicles) {
        const dir = v.reversed ? -1 : 1
        v.progress += v.speed * dir
        if (v.progress >= 1) v.progress = 0
        if (v.progress < 0) v.progress = 1

        let vx: number, vy: number
        if (v.dir === "h") {
          vx = PAD_X + (v.col + v.progress) * CELL_W
          vy = PAD_Y + v.row * CELL_H
        } else {
          vx = PAD_X + v.col * CELL_W
          vy = PAD_Y + (v.row + v.progress) * CELL_H
        }

        // Signal ring for Jack-connected
        if (v.jack) {
          v.sigTimer += dt
          if (v.sigTimer >= 2500) v.sigTimer = 0
          const sigProg = v.sigTimer / 2500
          const sigR = sigProg * 24
          const sigA = (1 - sigProg) * 0.42
          ctx.beginPath(); ctx.arc(vx, vy, sigR, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0,212,255,${sigA})`; ctx.lineWidth = 1; ctx.stroke()
          if (sigR > 8) {
            ctx.beginPath(); ctx.arc(vx, vy, sigR * 0.55, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(0,212,255,${sigA * 0.5})`; ctx.lineWidth = 0.5; ctx.stroke()
          }
        }

        // Draw vehicle shape
        ctx.save()
        ctx.translate(vx, vy)
        if (v.dir === "v") ctx.rotate(Math.PI / 2)
        if (v.reversed) ctx.scale(-1, 1)

        if (v.type === "sedan") {
          ctx.fillStyle = v.jack ? "#00D4FF" : "rgba(232,244,248,0.78)"
          if (v.jack) { ctx.shadowColor = "#00D4FF"; ctx.shadowBlur = 6 }
          ctx.fillRect(-3, -1.5, 6, 3)
          // Windshield glint
          ctx.fillStyle = v.jack ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)"
          ctx.fillRect(-2, -1, 2, 0.8)
          ctx.shadowBlur = 0
        } else if (v.type === "truck") {
          ctx.fillStyle = "rgba(232,244,248,0.5)"
          ctx.fillRect(-5, -2.2, 10, 4.4)
          ctx.fillStyle = "rgba(232,244,248,0.25)"
          ctx.fillRect(-5, -2.2, 3, 4.4)
        } else {
          ctx.fillStyle = "rgba(245,166,35,0.88)"
          ctx.shadowColor = "#f5a623"; ctx.shadowBlur = 4
          ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, Math.PI * 2); ctx.fill()
          ctx.shadowBlur = 0
        }
        ctx.restore()
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [city])

  return <canvas ref={ref} className="h-full w-full" />
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function JackWorldMap() {
  const [activeCity, setActiveCity] = useState<CityDef | null>(null)

  const vehicleCounts: Record<string, { sedan: number; truck: number; moto: number }> = {
    "New York": { sedan: 20, truck: 8, moto: 10 },
    "Tokyo":    { sedan: 20, truck: 8, moto: 10 },
    "Bogotá":   { sedan: 20, truck: 8, moto: 10 },
    "default":  { sedan: 20, truck: 8, moto: 10 },
  }
  const vc = activeCity
    ? (vehicleCounts[activeCity.name] ?? vehicleCounts["default"])
    : null

  return (
    <section
      className="relative overflow-hidden py-16"
      style={{ background: "#020408" }}
    >
      {/* Section header */}
      <div className="mb-8 px-6 sm:px-10">
        <AnimatePresence mode="wait">
          {!activeCity ? (
            <motion.div
              key="world-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p
                className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: "#00D4FF" }}
              >
                JACK IS GLOBAL
              </p>
              <p className="text-center text-[12px]" style={{ color: "#8aabb8" }}>
                Drag to pan · Scroll to zoom · Click a city to explore
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="city-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between"
            >
              <button
                onClick={() => setActiveCity(null)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{ color: "#00D4FF" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                World Map
              </button>

              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "#00D4FF" }}>
                  JACK · {activeCity.name.toUpperCase()} · LIVE
                </p>
                <p className="text-[11px]" style={{ color: "#8aabb8" }}>
                  {activeCity.country} · Real-time mobility intelligence
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#16c784" }} />
                <span className="text-[9px] font-bold" style={{ color: "#16c784" }}>CONNECTED</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Canvas area */}
      <div className="relative mx-6 overflow-hidden rounded-2xl sm:mx-10" style={{ height: "460px", border: "1px solid rgba(0,212,255,0.1)" }}>
        <AnimatePresence mode="wait">
          {!activeCity ? (
            <motion.div
              key="world"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <WorldCanvas onCityClick={setActiveCity} />
            </motion.div>
          ) : (
            <motion.div
              key={activeCity.name}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4 }}
            >
              <CityCanvas city={activeCity} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner decoration */}
        {[
          "top-0 left-0 border-t border-l",
          "top-0 right-0 border-t border-r",
          "bottom-0 left-0 border-b border-l",
          "bottom-0 right-0 border-b border-r",
        ].map((cls, i) => (
          <div key={i} className={`pointer-events-none absolute h-4 w-4 ${cls}`} style={{ borderColor: "rgba(0,212,255,0.35)" }} />
        ))}
      </div>

      {/* City stats strip (visible in city view) */}
      <AnimatePresence>
        {activeCity && vc && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-4 flex justify-center gap-6 px-6 sm:px-10"
          >
            {[
              { label: "Sedans", value: vc.sedan, color: "#e8f4f8" },
              { label: "Trucks", value: vc.truck, color: "rgba(232,244,248,0.5)" },
              { label: "Motos", value: vc.moto, color: "#f5a623" },
              { label: "Jack-Connected", value: Math.round((vc.sedan + vc.truck + vc.moto) * 0.32), color: "#00D4FF" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-base font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#8aabb8" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global stats strip (visible in world view) */}
      <AnimatePresence>
        {!activeCity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mt-4 flex justify-center gap-8 px-6 sm:px-10"
          >
            {[
              { label: "Cities Online",  value: "10",   color: "#00D4FF" },
              { label: "Countries",      value: "10",   color: "#16c784" },
              { label: "Jack Nodes",     value: "380+", color: "#e8f4f8" },
              { label: "Hazards Mapped", value: "24/7", color: "#f5a623" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-base font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#8aabb8" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform badges */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 px-6 sm:px-10">
        {[
          { label: "Android",      active: true  },
          { label: "Android Auto", active: true  },
          { label: "AAOS",         active: true  },
          { label: "Wearables",    active: false },
          { label: "Fleet",        active: false },
          { label: "iPhone",       active: false },
        ].map(p => (
          <span
            key={p.label}
            className="relative flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={
              p.active
                ? { background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.22)", color: "#00D4FF" }
                : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", color: "#8aabb8" }
            }
          >
            {p.label}
            {!p.active && (
              <span
                className="ml-1 rounded-full px-1 py-px text-[8px] font-bold"
                style={{ background: "rgba(245,166,35,0.12)", color: "#f5a623" }}
              >
                soon
              </span>
            )}
          </span>
        ))}
      </div>
    </section>
  )
}
