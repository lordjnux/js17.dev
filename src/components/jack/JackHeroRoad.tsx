"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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

      const sky = ctx.createLinearGradient(0, 0, 0, VPY)
      sky.addColorStop(0, "#020408")
      sky.addColorStop(1, "#060e18")
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, VPY + 2)

      const glow = ctx.createRadialGradient(VPX, VPY, 0, VPX, VPY, W * 0.55)
      glow.addColorStop(0, "rgba(0,212,255,0.14)")
      glow.addColorStop(0.35, "rgba(0,140,200,0.06)")
      glow.addColorStop(1, "transparent")
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.ellipse(VPX, VPY, W * 0.55, H * 0.35, 0, 0, Math.PI * 2)
      ctx.fill()

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

      dashOffset = (dashOffset + 2.8) % 100
      const NUM = 18
      for (let i = 0; i < NUM; i++) {
        const rawT = ((i / NUM) + dashOffset / 100) % 1
        const t = Math.pow(rawT, 1.7)
        if (t < 0.015) continue
        const y = VPY + (H - VPY) * t
        const dh = Math.max(4, (H - VPY) * 0.065 * t)
        const dw = 2.5 + t * 12
        const alpha = Math.min(t * 2.2, 0.85)
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.75})`
        ctx.fillRect(VPX - dw / 2, y, dw, dh)
      }

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

// ─── Hazard & Police Overlay Canvas ──────────────────────────────────────────
function OverlayCanvas({ onHazardAlert }: { onHazardAlert: (msg: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const alertRef = useRef(onHazardAlert)
  alertRef.current = onHazardAlert

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    let raf: number
    const startTime = Date.now()
    let nextPoliceMs = 8000 + Math.random() * 12000
    let nextHazardMs = 14000 + Math.random() * 11000

    let policeStart: number | null = null
    let hazardStart: number | null = null

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      const now = Date.now()
      const elapsed = now - startTime

      ctx.clearRect(0, 0, W, H)

      if (policeStart === null && elapsed >= nextPoliceMs) {
        policeStart = now
        nextPoliceMs = elapsed + 8000 + Math.random() * 12000
      }
      if (hazardStart === null && elapsed >= nextHazardMs) {
        hazardStart = now
        alertRef.current("HAZARD REPORTED · 0.8 km")
        nextHazardMs = elapsed + 12000 + Math.random() * 13000
      }

      // Police strobe — alternating blue/red edge glow
      if (policeStart !== null) {
        const t = now - policeStart
        if (t >= 1500) {
          policeStart = null
        } else {
          const phase = Math.floor(t / 110) % 2
          const fade = (1 - t / 1500) * 0.2
          const c = phase === 0
            ? `rgba(30,60,255,${fade.toFixed(3)})`
            : `rgba(255,30,30,${(fade * 0.9).toFixed(3)})`
          const glow = ctx.createRadialGradient(W * 0.06, H * 0.52, 0, W * 0.06, H * 0.52, W * 0.42)
          glow.addColorStop(0, c)
          glow.addColorStop(1, "transparent")
          ctx.fillStyle = glow
          ctx.fillRect(0, 0, W, H)
        }
      }

      // Hazard ping — expanding amber ring at horizon
      if (hazardStart !== null) {
        const t = now - hazardStart
        if (t >= 2200) {
          hazardStart = null
        } else {
          const progress = t / 2200
          const radius = progress * 90
          const alpha = (1 - progress) * 0.75
          const x = W * 0.5
          const y = H * 0.41

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(245,166,35,${alpha})`
          ctx.lineWidth = 2
          ctx.stroke()

          // Second ring slightly behind
          if (radius > 20) {
            ctx.beginPath()
            ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(245,166,35,${alpha * 0.4})`
            ctx.lineWidth = 1
            ctx.stroke()
          }

          // Center dot fades as ring expands
          if (progress < 0.4) {
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(245,166,35,${(0.4 - progress) / 0.4 * 0.9})`
            ctx.fill()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, []) // alertRef keeps callback current without re-running

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
    />
  )
}

// ─── Audio Engine ─────────────────────────────────────────────────────────────
function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const [enabled, setEnabled] = useState(false)

  const toggle = useCallback(() => {
    if (!ctxRef.current) {
      const ctx = new AudioContext()
      ctxRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser
      analyser.connect(ctx.destination)

      // Rain / wet-road texture — white noise → low-pass → gain
      const sr = ctx.sampleRate
      const noiseBuf = ctx.createBuffer(1, sr * 2, sr)
      const ch = noiseBuf.getChannelData(0)
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuf
      noise.loop = true
      const lp = ctx.createBiquadFilter()
      lp.type = "lowpass"
      lp.frequency.value = 300
      lp.Q.value = 0.5
      const rainGain = ctx.createGain()
      rainGain.gain.value = 0.12
      noise.connect(lp)
      lp.connect(rainGain)
      rainGain.connect(analyser)
      noise.start()

      // Engine hum — low sine oscillator
      const osc = ctx.createOscillator()
      osc.type = "sine"
      osc.frequency.value = 80
      const engGain = ctx.createGain()
      engGain.gain.value = 0.06
      osc.connect(engGain)
      engGain.connect(analyser)
      osc.start()

      setEnabled(true)
    } else if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume()
      setEnabled(true)
    } else {
      ctxRef.current.suspend()
      setEnabled(false)
    }
  }, [])

  useEffect(() => () => { ctxRef.current?.close() }, [])

  return { enabled, toggle, analyser: enabled ? analyserRef.current : null }
}

// ─── Waveform Bars ────────────────────────────────────────────────────────────
function VoiceWave({ analyser }: { analyser: AnalyserNode | null }) {
  const [heights, setHeights] = useState([40, 70, 90, 55, 75, 45, 60])
  const rafRef = useRef<number>()
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  useEffect(() => {
    if (analyser) {
      dataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
      const tick = () => {
        analyser.getByteFrequencyData(dataRef.current!)
        const d = dataRef.current!
        const binSize = Math.max(1, Math.floor(d.length / 7))
        setHeights(
          Array.from({ length: 7 }, (_, i) =>
            15 + (d[Math.min(i * binSize, d.length - 1)] / 255) * 85
          )
        )
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    } else {
      const id = setInterval(() => setHeights(h => h.map(() => 20 + Math.random() * 80)), 160)
      return () => clearInterval(id)
    }
  }, [analyser])

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
            transition: analyser ? "height 0.05s ease" : "height 0.15s ease",
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  )
}

// ─── Conversation Script ──────────────────────────────────────────────────────
type DialogueTurn = { speaker: "driver" | "jack"; text: string; pauseBefore?: number }

const CONVERSATION: DialogueTurn[] = [
  { speaker: "driver", text: "Hey Jack.", pauseBefore: 600 },
  { speaker: "jack",   text: "Hey. Traffic is building up on your usual route to Chapinero. ETA is now 34 minutes. Want me to take you through La Candelaria? Saves about 12 minutes.", pauseBefore: 300 },
  { speaker: "driver", text: "Yeah, go for it.", pauseBefore: 400 },
  { speaker: "jack",   text: "Rerouting. Turn left in 400 meters.", pauseBefore: 200 },
  { speaker: "driver", text: "Hey, what time is my meeting again?", pauseBefore: 900 },
  { speaker: "jack",   text: "Your next event is with Camilo at 10:30. Based on current traffic, you will arrive with 8 minutes to spare.", pauseBefore: 250 },
  { speaker: "driver", text: "Perfect. Can you call him?", pauseBefore: 500 },
  { speaker: "jack",   text: "Calling Camilo now.", pauseBefore: 250 },
  { speaker: "jack",   text: "He is not answering. Want me to send a message instead?", pauseBefore: 2000 },
  { speaker: "driver", text: "Yeah, tell him I am on my way.", pauseBefore: 400 },
  { speaker: "jack",   text: "Done. Message sent.", pauseBefore: 250 },
  { speaker: "driver", text: "Hey Jack, there is a pothole on the right side, pretty bad.", pauseBefore: 1400 },
  { speaker: "jack",   text: "Got it. Hazard reported at your location. I have notified 23 drivers behind you. Want me to avoid this stretch tomorrow?", pauseBefore: 250 },
  { speaker: "driver", text: "Yes please.", pauseBefore: 350 },
  { speaker: "jack",   text: "Noted. Updating your morning route. By the way, you are below a quarter tank. There is a Terpel station 2 kilometers ahead, right on your route.", pauseBefore: 250 },
  { speaker: "driver", text: "I will stop there.", pauseBefore: 500 },
  { speaker: "jack",   text: "Alright. Holding the reroute until after your stop.", pauseBefore: 300 },
  { speaker: "driver", text: "Put on something good.", pauseBefore: 1000 },
  { speaker: "jack",   text: "Playing your Monday morning mix. Turn coming up in 300 meters, stay in the left lane.", pauseBefore: 250 },
  { speaker: "jack",   text: "You are 8 minutes out. Camilo just replied, says he will be downstairs.", pauseBefore: 3500 },
  { speaker: "driver", text: "Nice. Thanks Jack.", pauseBefore: 450 },
  { speaker: "jack",   text: "Always watching your road.", pauseBefore: 250 },
]

// ─── Conversation Engine ──────────────────────────────────────────────────────
function useConversationEngine() {
  const [activeSpeaker, setActiveSpeaker] = useState<"driver" | "jack" | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [started, setStarted] = useState(false)
  const hasPlayedRef = useRef(false)
  const cancelledRef = useRef(false)
  const pausedRef = useRef(false)
  const currentIndexRef = useRef(0)   // always tracks the turn currently playing/pending
  const jackVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const driverVoiceRef = useRef<SpeechSynthesisVoice | null>(null)

  const resolveVoices = useCallback(() => {
    if (typeof window === "undefined") return
    const voices = window.speechSynthesis.getVoices()
    jackVoiceRef.current =
      voices.find(v => v.lang.startsWith("en") &&
        (v.name.includes("David") || v.name.includes("Daniel") || v.name.includes("Mark") || v.name.includes("George"))) ??
      voices.find(v => v.lang.startsWith("en")) ?? null
    driverVoiceRef.current =
      voices.find(v => v.lang.startsWith("en") &&
        (v.name.includes("Zira") || v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Victoria"))) ??
      voices.find(v => v.lang.startsWith("en") && v !== jackVoiceRef.current) ?? null
  }, [])

  const playFrom = useCallback((index: number) => {
    if (cancelledRef.current || index >= CONVERSATION.length) {
      setActiveSpeaker(null)
      return
    }
    currentIndexRef.current = index
    const turn = CONVERSATION[index]
    const go = () => {
      if (cancelledRef.current || pausedRef.current) return
      setActiveSpeaker(turn.speaker)
      const utt = new SpeechSynthesisUtterance(turn.text)
      if (turn.speaker === "jack") {
        utt.rate = 0.88; utt.pitch = 0.78; utt.volume = 0.92
        if (jackVoiceRef.current) utt.voice = jackVoiceRef.current
      } else {
        utt.rate = 1.02; utt.pitch = 1.15; utt.volume = 0.88
        if (driverVoiceRef.current) utt.voice = driverVoiceRef.current
      }
      utt.onend = () => {
        if (cancelledRef.current || pausedRef.current) return
        setTimeout(() => playFrom(index + 1), 280)
      }
      window.speechSynthesis.speak(utt)
    }
    if (turn.pauseBefore) { setTimeout(go, turn.pauseBefore) } else { go() }
  }, [])

  const start = useCallback(() => {
    if (hasPlayedRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return
    hasPlayedRef.current = true
    cancelledRef.current = false
    setStarted(true)
    resolveVoices()
    if (window.speechSynthesis.getVoices().length > 0) {
      playFrom(0)
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", () => { resolveVoices(); playFrom(0) }, { once: true })
    }
  }, [resolveVoices, playFrom])

  const pause = useCallback(() => {
    pausedRef.current = true
    setIsPaused(true)
    // cancel() is reliable cross-browser; currentIndexRef holds where to resume from
    if (typeof window !== "undefined") window.speechSynthesis.cancel()
  }, [])

  const resume = useCallback(() => {
    pausedRef.current = false
    setIsPaused(false)
    playFrom(currentIndexRef.current)
  }, [playFrom])

  useEffect(() => () => { cancelledRef.current = true; window.speechSynthesis?.cancel() }, [])

  return { activeSpeaker, isPaused, started, start, pause, resume }
}

// ─── Glass HUD panel ─────────────────────────────────────────────────────────
function HUDPanel({
  children,
  className = "",
  accent = "#00D4FF",
  style,
}: {
  children: React.ReactNode
  className?: string
  accent?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 ${className}`}
      style={{
        background: "rgba(4,10,18,0.82)",
        border: `1px solid ${accent}44`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
const USE_RUNWAY_VIDEO = true

export function JackHeroRoad() {
  const { enabled: audioEnabled, toggle: toggleAudio, analyser } = useAudioEngine()
  const { activeSpeaker, isPaused, started: convStarted, start: startConversation, pause: pauseConversation, resume: resumeConversation } = useConversationEngine()
  const [hudAlert, setHudAlert] = useState("300m ahead · Police reported · 4 min ago")
  const [hudFlash, setHudFlash] = useState(false)

  // Start conversation exactly once on first audio enable
  useEffect(() => {
    if (audioEnabled) startConversation()
  }, [audioEnabled, startConversation])

  const handleHazardAlert = useCallback((msg: string) => {
    setHudAlert(msg)
    setHudFlash(true)
    const t = window.setTimeout(() => setHudFlash(false), 2000)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <section
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ background: "#020408" }}
    >
      {USE_RUNWAY_VIDEO ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          src="/jack/hero-road.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <RoadCanvas />
      )}

      {/* Police & hazard overlay — canvas on top of video */}
      <OverlayCanvas onHazardAlert={handleHazardAlert} />

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
            <p className="text-[10px]" style={{ color: "#8aabb8" }}>via Autopista Norte · 14 min</p>
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

        {/* Voice indicator + audio toggle */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 1.6 }}
        >
          <HUDPanel>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
                Jack · Listening
              </p>
              <button
                onClick={toggleAudio}
                aria-label={audioEnabled ? "Mute ambient audio" : "Hear Jack's world"}
                title={audioEnabled ? "Mute" : "Hear Jack's world"}
                style={{
                  background: audioEnabled ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${audioEnabled ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 6,
                  padding: "3px 6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                }}
              >
                {audioEnabled ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b8fa8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                )}
              </button>
            </div>
            <VoiceWave analyser={analyser} />
            {(activeSpeaker || isPaused) && convStarted && (
              <div className="mt-1.5 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <motion.span
                    animate={{ opacity: isPaused ? 1 : [1, 0.3, 1] }}
                    transition={{ duration: 0.7, repeat: isPaused ? 0 : Infinity }}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: isPaused ? "#f5a623" : activeSpeaker === "jack" ? "#00D4FF" : "#16c784",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: isPaused ? "#f5a623" : activeSpeaker === "jack" ? "#00D4FF" : "#16c784",
                    }}
                  >
                    {isPaused ? "Paused" : activeSpeaker === "jack" ? "Jack" : "You"}
                  </span>
                </div>
                <button
                  onClick={isPaused ? resumeConversation : pauseConversation}
                  aria-label={isPaused ? "Resume conversation" : "Pause conversation"}
                  style={{
                    background: isPaused ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isPaused ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 5,
                    padding: "2px 6px",
                    cursor: "pointer",
                    fontSize: 9,
                    fontWeight: 700,
                    color: isPaused ? "#00D4FF" : "#8aabb8",
                    letterSpacing: "0.05em",
                    lineHeight: 1,
                  }}
                >
                  {isPaused ? "▶" : "‖"}
                </button>
              </div>
            )}
          </HUDPanel>
        </motion.div>
      </div>

      {/* ── BOTTOM CONTENT ── */}
      <div className="relative z-10 mt-auto px-6 pb-20 text-center sm:px-10">

        {/* Hazard alert — flashes when overlay triggers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
          className="mb-10 flex justify-center"
        >
          <HUDPanel
            accent="#f5a623"
            className="flex items-center gap-3 transition-all duration-300"
            style={{
              boxShadow: hudFlash ? "0 0 20px rgba(245,166,35,0.35)" : "none",
            } as React.CSSProperties}
          >
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#f5a623" }} />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: "#f5a623" }} />
            </span>
            <span
              className="text-xs font-bold tracking-wide transition-colors duration-300"
              style={{ color: hudFlash ? "#ffd700" : "#f5a623" }}
            >
              HAZARD
            </span>
            <span className="text-xs transition-all duration-500" style={{ color: "#8aabb8" }}>
              {hudAlert}
            </span>
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
          style={{ color: "#b2cdd8", lineHeight: 1.7 }}
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
