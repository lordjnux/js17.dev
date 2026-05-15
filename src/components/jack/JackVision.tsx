"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function JackVision() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })

  return (
    <section
      ref={ref}
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-32"
      style={{ background: "#050505" }}
    >
      {/* Glow orb */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "rgba(0,212,255,0.5)" }}
        >
          The Vision
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
          className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ color: "#e8f4f8" }}
        >
          We&apos;re not building
          <br />
          another app.
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mx-auto my-8 h-px w-32 origin-left"
          style={{ background: "linear-gradient(90deg, #00D4FF, transparent)" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-2xl font-medium leading-relaxed sm:text-3xl md:text-4xl"
          style={{ color: "rgba(0,212,255,0.9)" }}
        >
          We&apos;re redefining how drivers
          <br />
          and machines communicate.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-8 text-base leading-relaxed"
          style={{ color: "#6b8fa8" }}
        >
          Every second you look at a screen while driving is a second your eyes aren&apos;t on the road.
        </motion.p>
      </div>
    </section>
  )
}
