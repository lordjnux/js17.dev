"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const CARDS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    label: "Voice First",
    desc: "Say \"Hey Jack\" from a locked screen. No taps, no swipes — just your voice.",
    accent: "#00D4FF",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
        <path d="M4.93 4.93l14.14 14.14" />
      </svg>
    ),
    label: "Community Net",
    desc: "Real-time hazard alerts powered by every driver on the network. Warnings at 500m, 300m, and 200m.",
    accent: "#16c784",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    label: "Always On",
    desc: "Runs as a background service — never killed by the OS. Like Spotify, but for your safety.",
    accent: "#f5a623",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
    label: "Android Auto",
    desc: "Navigation steps and maneuver icons on your car's display. Your dashboard, elevated.",
    accent: "#00D4FF",
  },
]

export function JackCapabilities() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })

  return (
    <section
      ref={ref}
      className="px-6 py-24 md:py-32"
      style={{ background: "#050505" }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#00D4FF" }}
          >
            What Jack Does
          </p>
          <h2
            className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "#e8f4f8" }}
          >
            Intelligence that moves with you.
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
              whileHover={{ scale: 1.02, borderColor: card.accent }}
              className="group rounded-2xl p-7 transition-colors duration-200"
              style={{
                background: "#0d0d1a",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: `${card.accent}14`,
                  border: `1px solid ${card.accent}30`,
                  color: card.accent,
                }}
              >
                {card.icon}
              </div>
              <h3
                className="mb-2 text-lg font-bold"
                style={{ color: "#e8f4f8" }}
              >
                {card.label}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#b2cdd8" }}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
