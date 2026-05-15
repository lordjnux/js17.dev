"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const PLATFORMS = [
  { label: "Android", available: true },
  { label: "Android Auto", available: true },
  { label: "AAOS", available: true },
  { label: "Wearables", available: false },
  { label: "Fleet", available: false },
  { label: "iPhone", available: false },
]

export function JackEcosystem() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-6 py-24 md:py-32"
      style={{ background: "#0a0a14" }}
    >
      {/* Circuit grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#00D4FF" }}
          >
            Ecosystem
          </p>
          <h2
            className="mb-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "#e8f4f8" }}
          >
            Built for the full mobility stack.
          </h2>
          <p className="mb-12 text-base" style={{ color: "#6b8fa8" }}>
            From your pocket to your dashboard — and beyond.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {PLATFORMS.map((p) => (
            <span
              key={p.label}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
              style={
                p.available
                  ? {
                      background: "rgba(0,212,255,0.1)",
                      border: "1px solid rgba(0,212,255,0.35)",
                      color: "#00D4FF",
                    }
                  : {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(107,143,168,0.5)",
                    }
              }
            >
              {p.label}
              {!p.available && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(245,166,35,0.15)", color: "#f5a623" }}
                >
                  coming
                </span>
              )}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
