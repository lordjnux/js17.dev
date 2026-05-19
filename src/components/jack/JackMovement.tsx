"use client"

import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { useRef } from "react"

export function JackMovement() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-6 py-28 md:py-36"
      style={{ background: "#050505" }}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 60%, rgba(22,199,132,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#16c784" }}
        >
          The Movement
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl"
          style={{ color: "#e8f4f8" }}
        >
          Be the First 100.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-5 text-lg leading-relaxed"
          style={{ color: "#b2cdd8" }}
        >
          Help shape the future of mobility intelligence.
          <br />
          Early testers get lifetime Pro access.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-10"
        >
          <Link
            href="#waitlist"
            className="group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold tracking-wide transition-all duration-200"
            style={{
              background: "#16c784",
              color: "#050505",
              boxShadow: "0 0 24px rgba(22,199,132,0.3)",
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 40px rgba(22,199,132,0.5)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 24px rgba(22,199,132,0.3)"
            }}
          >
            Join the Community
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
        </motion.div>
      </div>
    </section>
  )
}
