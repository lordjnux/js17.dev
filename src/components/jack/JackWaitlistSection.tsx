"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { JackWaitlist } from "@/components/blog/JackWaitlist"

export function JackWaitlistSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })

  return (
    <section
      id="waitlist"
      ref={ref}
      className="relative overflow-hidden px-6 py-24 md:py-32"
      style={{ background: "#0a0a14" }}
    >
      {/* Glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-2 text-center"
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#00D4FF" }}
          >
            Early Access
          </p>
          <h2
            className="text-3xl font-black tracking-tight sm:text-4xl"
            style={{ color: "#e8f4f8" }}
          >
            Get in before the launch.
          </h2>
          <p className="mt-3 text-base" style={{ color: "#6b8fa8" }}>
            Select your role and leave your email. We&apos;ll reach out when it matters.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <JackWaitlist />
        </motion.div>
      </div>
    </section>
  )
}
