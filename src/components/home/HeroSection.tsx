"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CVDownloadButton } from "@/components/shared/CVDownloadButton"
import { SITE_CONFIG } from "@/lib/constants"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="container-custom py-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          {/* Availability badge */}
          <motion.div variants={item} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Available for new projects
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={item}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance"
          >
            Senior{" "}
            <span className="gradient-text">AI-Augmented</span>
            <br />
            Fullstack Systems
            <br />
            Engineer
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
          >
            8+ years building scalable production systems. I bridge the gap between
            cutting-edge AI capabilities and robust engineering — shipping products
            that perform, scale, and last.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button size="xl" asChild className="group">
              <Link href="/proposal">
                <Sparkles className="mr-2 h-5 w-5" />
                Request a Proposal
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <CVDownloadButton size="xl" variant="outline" />

            <Button size="xl" variant="ghost" asChild>
              <a
                href={`https://cal.com/${SITE_CONFIG.calcom.username}/${SITE_CONFIG.calcom.eventType}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Schedule a Call
              </a>
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={item}
            className="mt-16 flex flex-wrap gap-8"
          >
            {[
              { label: "Years Experience", value: "8+" },
              { label: "Projects Shipped", value: "50+" },
              { label: "Uptime SLA", value: "99.9%" },
              { label: "AI Systems Built", value: "15+" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
