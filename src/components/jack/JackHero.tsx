"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
}

export function JackHero() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: "#050505" }}
    >
      {/* Animated radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 55%, rgba(0,212,255,0.10) 0%, transparent 70%)",
          animation: "jackGlow 5s ease-in-out infinite",
        }}
      />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-4xl flex-col items-center gap-8"
      >
        {/* Live badge */}
        <motion.div variants={item}>
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase"
            style={{
              border: "1px solid rgba(0,212,255,0.3)",
              background: "rgba(0,212,255,0.07)",
              color: "#00D4FF",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ background: "#00D4FF" }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: "#00D4FF" }}
              />
            </span>
            v0.10 · Android · Available Now
          </span>
        </motion.div>

        {/* Icon */}
        <motion.div
          variants={item}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 32px rgba(0,212,255,0.35))" }}
        >
          <Image
            src="/jack/icon-assistant.svg"
            alt="Jack — The Assistant"
            width={160}
            height={160}
            priority
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ color: "#e8f4f8", lineHeight: 1.05 }}
        >
          The AI Copilot
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #00D4FF 0%, #7de8ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            for Mobility.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={item}
          className="max-w-xl text-lg sm:text-xl"
          style={{ color: "#6b8fa8", lineHeight: 1.65 }}
        >
          Voice-first intelligence. Eyes on the road.
          <br />
          Zero screen taps from start to finish.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="#waitlist"
            className="group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold tracking-wide transition-all duration-200"
            style={{
              background: "#00D4FF",
              color: "#050505",
              boxShadow: "0 0 24px rgba(0,212,255,0.35)",
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 40px rgba(0,212,255,0.55)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 24px rgba(0,212,255,0.35)"
            }}
          >
            Join the Waitlist
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <Link
            href="#waitlist"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold tracking-wide transition-all duration-200"
            style={{
              border: "1px solid rgba(0,212,255,0.25)",
              color: "#00D4FF",
              background: "rgba(0,212,255,0.05)",
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download APK
          </Link>

          <div className="relative">
            <button
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold tracking-wide opacity-40"
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#6b8fa8",
                background: "transparent",
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76A2 2 0 014.95 24c.42 0 .83-.08 1.2-.27l13.03-7.15a2 2 0 000-3.16L6.15.47A2 2 0 003 2.25v19.5c0 .73.39 1.38.97 1.73L4 23.76z" />
                <path
                  d="M1.4 1.22l11.32 11.3L1.4 22.78"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
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

        {/* Scroll hint */}
        <motion.div
          variants={item}
          className="mt-4 flex flex-col items-center gap-2"
          style={{ color: "rgba(107,143,168,0.5)" }}
        >
          <svg
            className="h-5 w-5 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes jackGlow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.06); }
        }
      `}</style>
    </section>
  )
}
