"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const TIERS = [
  {
    id: "now",
    label: "Today",
    badge: "Live · v0.10",
    badgeColor: "#00D4FF",
    borderColor: "rgba(0,212,255,0.25)",
    glowColor: "rgba(0,212,255,0.07)",
    devices: [
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        ),
        name: "Android Phone",
        desc: "Your always-on voice copilot. Locked screen. Background. Zero taps.",
      },
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2" />
            <line x1="6" y1="21" x2="10" y2="21" />
            <line x1="8" y1="16" x2="8" y2="21" />
          </svg>
        ),
        name: "Android Auto",
        desc: "Turn-by-turn navigation and Jack on your car's screen. No phone needed.",
      },
    ],
  },
  {
    id: "near",
    label: "Next",
    badge: "In Development",
    badgeColor: "#f5a623",
    borderColor: "rgba(245,166,35,0.2)",
    glowColor: "rgba(245,166,35,0.05)",
    devices: [
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        ),
        name: "Android Automotive OS",
        desc: "Deep system-level integration with the car's native OS — no phone required at all.",
      },
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        ),
        name: "WearOS Wearables",
        desc: "Haptic hazard alerts and quick commands from your wrist while you drive.",
      },
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2" />
            <circle cx="8" cy="21" r="1" /><circle cx="16" cy="21" r="1" />
          </svg>
        ),
        name: "Fleet Management",
        desc: "Jack coordinating entire vehicle fleets — logistics, safety, and voice for every driver.",
      },
    ],
  },
  {
    id: "vision",
    label: "The Vision",
    badge: "Future",
    badgeColor: "rgba(232,244,248,0.4)",
    borderColor: "rgba(255,255,255,0.08)",
    glowColor: "rgba(255,255,255,0.02)",
    devices: [
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
        name: "AR Glasses",
        desc: "Spatial HUD projected onto your field of view — navigation arrows on the real road.",
      },
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M12 18h.01" />
          </svg>
        ),
        name: "iPhone",
        desc: "Jack for iOS — bringing the voice-first experience to Apple users everywhere.",
      },
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
        ),
        name: "Smart Infrastructure",
        desc: "Jack communicating with traffic systems, smart roads, and connected city infrastructure.",
      },
    ],
  },
]

export function JackFuture() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-6 py-28 md:py-36"
      style={{ background: "#050505" }}
    >
      {/* Faint connecting line across all tiers */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.6 }}
        className="pointer-events-none absolute left-[10%] right-[10%] hidden origin-left md:block"
        style={{
          top: "50%",
          height: 1,
          background: "linear-gradient(90deg, rgba(0,212,255,0.3), rgba(245,166,35,0.2), rgba(255,255,255,0.07))",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
            Complete Ecosystem
          </p>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl" style={{ color: "#e8f4f8" }}>
            Built for every screen.
            <br />
            <span style={{ color: "rgba(0,212,255,0.85)" }}>Every moment. Every road.</span>
          </h2>
          <p className="mt-5 text-base" style={{ color: "#b2cdd8" }}>
            Jack doesn&apos;t stop at your phone. The intelligence expands across every surface you interact with while moving.
          </p>
        </motion.div>

        {/* Tiers */}
        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((tier, ti) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 + ti * 0.15 }}
              className="relative rounded-2xl p-6"
              style={{
                background: tier.glowColor,
                border: `1px solid ${tier.borderColor}`,
              }}
            >
              {/* Tier header */}
              <div className="mb-6 flex items-center justify-between">
                <span
                  className="text-lg font-black tracking-tight"
                  style={{ color: ti === 2 ? "rgba(232,244,248,0.65)" : "#e8f4f8" }}
                >
                  {tier.label}
                </span>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    background: `${tier.badgeColor}18`,
                    border: `1px solid ${tier.badgeColor}40`,
                    color: tier.badgeColor,
                  }}
                >
                  {tier.badge}
                </span>
              </div>

              {/* Devices */}
              <div className="flex flex-col gap-5">
                {tier.devices.map((device, di) => (
                  <motion.div
                    key={device.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + ti * 0.15 + di * 0.08 }}
                    className="flex gap-3"
                  >
                    <div
                      className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: `${tier.badgeColor}12`,
                        border: `1px solid ${tier.badgeColor}25`,
                        color: ti === 2 ? "rgba(232,244,248,0.55)" : tier.badgeColor,
                      }}
                    >
                      {device.icon}
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold leading-snug"
                        style={{ color: ti === 2 ? "rgba(232,244,248,0.75)" : "#e8f4f8" }}
                      >
                        {device.name}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed" style={{ color: ti === 2 ? "#8aabb8" : "#b2cdd8" }}>
                        {device.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* "VISION" spectral overlay for future tier */}
              {tier.id === "vision" && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, transparent 60%, rgba(0,0,0,0.4))",
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-10 text-center text-xs"
          style={{ color: "#8aabb8" }}
        >
          From Colombia to the world — one voice at a time.
        </motion.p>
      </div>
    </section>
  )
}
