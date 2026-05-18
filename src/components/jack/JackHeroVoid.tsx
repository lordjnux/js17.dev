"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { JackHeroRoad } from "./JackHeroRoad"

type Stage = "void" | "summoning" | "alive" | "gone"

const VOICE_LINE = "Hey. I'm Jack. I've been waiting for you."

const STREAM_SEGMENTS = [
  "Processing...",
  "Location detected",
  "Road conditions loading...",
  "12 hazards near you",
  "Ready.",
]

function speakJack(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 0.85
  utt.pitch = 0.8
  utt.volume = 1
  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices()
    const preferred =
      voices.find(v =>
        v.lang.startsWith("en") &&
        (v.name.includes("Daniel") || v.name.includes("David") ||
          v.name.includes("Alex") || v.name.includes("Male"))
      ) || voices.find(v => v.lang.startsWith("en"))
    if (preferred) utt.voice = preferred
    window.speechSynthesis.speak(utt)
  }
  if (window.speechSynthesis.getVoices().length > 0) {
    trySpeak()
  } else {
    window.speechSynthesis.addEventListener("voiceschanged", trySpeak, { once: true })
  }
}

// ─── Idle void: mic orb + sonar rings ────────────────────────────────────────
function VoidIdle() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "1px solid rgba(0,212,255,0.2)",
          }}
          animate={{ scale: [1, 5], opacity: [0.5, 0] }}
          transition={{ duration: 3.5, delay: i * 1.15, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      <motion.div
        animate={{
          boxShadow: [
            "0 0 0px rgba(0,212,255,0.0)",
            "0 0 50px rgba(0,212,255,0.18)",
            "0 0 0px rgba(0,212,255,0.0)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(0,212,255,0.05)",
          border: "1px solid rgba(0,212,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00D4FF"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.55 }}
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.2, duration: 1.8 }}
        style={{
          marginTop: 28,
          fontSize: 10,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "#00D4FF",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 400,
        }}
      >
        Tap to meet Jack
      </motion.p>
    </>
  )
}

// ─── Summoning: voice line + segment stream ───────────────────────────────────
function VoidSummoning({ shownSegments }: { shownSegments: number }) {
  return (
    <div style={{ maxWidth: 580, padding: "0 32px", textAlign: "center" }}>
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          fontSize: 14,
          letterSpacing: "0.05em",
          color: "rgba(255,255,255,0.25)",
          marginBottom: 44,
          fontStyle: "italic",
          fontFamily: "var(--font-inter, sans-serif)",
          lineHeight: 1.6,
        }}
      >
        &ldquo;{VOICE_LINE}&rdquo;
      </motion.p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start", width: "100%" }}>
        {STREAM_SEGMENTS.map((seg, i) => (
          <motion.div
            key={seg}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: i < shownSegments ? 1 : 0, x: i < shownSegments ? 0 : -20 }}
            transition={{ duration: 0.35 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "clamp(11px, 1.8vw, 14px)",
              letterSpacing: "0.07em",
              color: i === shownSegments - 1 ? "#00D4FF" : "rgba(0,212,255,0.35)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ color: "rgba(0,212,255,0.25)", fontSize: "0.85em" }}>›</span>
            {seg}
            {i === shownSegments - 1 && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ color: "#00D4FF" }}
              >
                ▊
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Main overlay ─────────────────────────────────────────────────────────────
function VoidLayer({
  stage,
  onSummon,
  onStreamDone,
}: {
  stage: Stage
  onSummon: () => void
  onStreamDone: () => void
}) {
  const [shownSegments, setShownSegments] = useState(0)
  const hasSpoken = useRef(false)

  useEffect(() => {
    if (stage !== "summoning") return
    if (!hasSpoken.current) {
      hasSpoken.current = true
      speakJack(VOICE_LINE)
    }
    let count = 0
    const interval = setInterval(() => {
      count++
      setShownSegments(count)
      if (count >= STREAM_SEGMENTS.length) {
        clearInterval(interval)
        setTimeout(onStreamDone, 650)
      }
    }, 480)
    return () => clearInterval(interval)
  }, [stage, onStreamDone])

  const fading = stage === "alive"

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: fading ? "none" : "auto",
        cursor: stage === "void" ? "pointer" : "default",
      }}
      onClick={stage === "void" ? onSummon : undefined}
    >
      {stage === "void" && <VoidIdle />}
      {stage === "summoning" && <VoidSummoning shownSegments={shownSegments} />}
    </motion.div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function JackHeroVoid() {
  const [stage, setStage] = useState<Stage>("void")

  // Lock scroll during void/summoning
  useEffect(() => {
    const shouldLock = stage === "void" || stage === "summoning"
    document.body.style.overflow = shouldLock ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [stage])

  const handleSummon = useCallback(() => setStage("summoning"), [])
  const handleStreamDone = useCallback(() => {
    setStage("alive")
    setTimeout(() => setStage("gone"), 2000)
  }, [])

  return (
    <div style={{ position: "relative" }}>
      <JackHeroRoad />
      {stage !== "gone" && (
        <VoidLayer stage={stage} onSummon={handleSummon} onStreamDone={handleStreamDone} />
      )}
    </div>
  )
}
