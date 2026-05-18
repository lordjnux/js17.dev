"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"

export function JackVoidReveal({
  children,
  voiceLine,
}: {
  children: React.ReactNode
  voiceLine?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-8%" })
  const [showLine, setShowLine] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!isInView || revealed) return
    if (voiceLine) {
      setShowLine(true)
      const t = setTimeout(() => setRevealed(true), 1700)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setRevealed(true), 400)
      return () => clearTimeout(t)
    }
  }, [isInView, voiceLine]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Section content — fades in after reveal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        {children}
      </motion.div>

      {/* Black void overlay */}
      {!revealed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            pointerEvents: "none",
            minHeight: 120,
          }}
        >
          {showLine && voiceLine && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.7, times: [0, 0.15, 0.75, 1] }}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "clamp(13px, 2.2vw, 18px)",
                color: "rgba(0,212,255,0.7)",
                letterSpacing: "0.07em",
                textAlign: "center",
                padding: "0 32px",
                fontWeight: 300,
                lineHeight: 1.5,
              }}
            >
              {voiceLine}
            </motion.p>
          )}
        </div>
      )}
    </div>
  )
}
