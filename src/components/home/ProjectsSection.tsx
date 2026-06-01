"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ExternalLink, Clock } from "lucide-react"

interface Project {
  title: string
  subtitle: string
  description: string
  tech: string[]
  href: string
  external?: boolean
  comingSoon?: boolean
  accentColor: string
  icon: React.ReactNode
}

const projects: Project[] = [
  {
    title: "Jack",
    subtitle: "AI Mobility Ecosystem",
    description:
      "AI-powered driver assistant with voice interface, real-time route intelligence, and direct Android Auto integration. Built for LATAM drivers.",
    tech: ["Next.js", "Google Speech API", "Android Auto", "WebSockets"],
    href: "/jack",
    accentColor: "#00D4FF",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/jack/icon-copilot.svg" alt="Jack" className="h-7 w-7" />
    ),
  },
  {
    title: "Live Fitness Dashboard",
    subtitle: "Strava Multi-Sport Integration",
    description:
      "Real-time pipeline ingesting all activity types from Strava — runs, rides, swims — with AI performance insights and streak tracking.",
    tech: ["Strava API", "Vercel Blob", "OpenAI", "Next.js ISR"],
    href: "/hobbies",
    accentColor: "#FC4C02",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
    ),
  },
  {
    title: "Chess Intelligence",
    subtitle: "Chess.com Live Tracker",
    description:
      "Live rating progression, game history analysis, and streak tracking synced directly from Chess.com with daily ISR cache refresh.",
    tech: ["Chess.com API", "Next.js ISR", "TypeScript"],
    href: "/hobbies",
    accentColor: "#769656",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 22H5v-2h14v2M17 2a2 2 0 0 1 2 2c0 .73-.41 1.38-1 1.72V7l-4 4v1H10v-1L6 7V5.72A2 2 0 0 1 5 4a2 2 0 0 1 2-2h10m-5 10H9l-1 3h8l-1-3h-3z" />
      </svg>
    ),
  },
  {
    title: "LinkedIn Job Automator",
    subtitle: "Automated Outreach System",
    description:
      "Python pipeline that discovers hiring managers via Hunter.io, generates personalized cold outreach, and automates LinkedIn applications at scale.",
    tech: ["Python", "Hunter.io API", "LinkedIn API", "OpenAI"],
    href: "https://github.com/lordjnux/linkedin-job-automator",
    external: true,
    accentColor: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    title: "Omnipresence Engine",
    subtitle: "Social Command Center",
    description:
      "Unified publishing hub: compose once, publish to X, LinkedIn personal & company page, and YouTube simultaneously with AI-generated copy.",
    tech: ["X API v2", "LinkedIn API v2", "OAuth 1.0a", "OpenAI"],
    href: "/admin/social",
    comingSoon: true,
    accentColor: "#6366F1",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
  },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function ProjectsSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="inline-block rounded-full border border-border/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
            Projects
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl gradient-text">
            What I&apos;ve Built
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Production systems, integrations, and products — each one a proof of capability.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)

  const cardStyle: React.CSSProperties = hovered && !project.comingSoon
    ? {
        borderColor: project.accentColor + "60",
        boxShadow: `0 8px 28px ${project.accentColor}18`,
        transform: "translateY(-3px)",
      }
    : {}

  const inner = (
    <div
      className="flex flex-col h-full rounded-xl border bg-card p-5 transition-all duration-300"
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: project.accentColor + "20", color: project.accentColor }}
        >
          {project.icon}
        </div>
        <div className="flex items-center gap-1.5">
          {project.comingSoon && (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400 uppercase tracking-wide">
              <Clock className="h-2.5 w-2.5" />
              Soon
            </span>
          )}
          {project.external && !project.comingSoon && (
            <ExternalLink
              className="h-3.5 w-3.5 transition-colors"
              style={{ color: hovered ? project.accentColor : undefined }}
            />
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mb-3">
        <h3 className="font-bold text-base leading-snug">{project.title}</h3>
        <p className="text-xs font-medium mt-0.5" style={{ color: project.accentColor }}>
          {project.subtitle}
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
        {project.description}
      </p>

      {/* Tech badges */}
      <div className="flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <span
            key={t}
            className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )

  if (project.comingSoon) {
    return (
      <motion.div variants={cardVariant} className="cursor-not-allowed opacity-80">
        {inner}
      </motion.div>
    )
  }

  if (project.external) {
    return (
      <motion.div variants={cardVariant}>
        <a href={project.href} target="_blank" rel="noopener noreferrer">
          {inner}
        </a>
      </motion.div>
    )
  }

  return (
    <motion.div variants={cardVariant}>
      <Link href={project.href}>{inner}</Link>
    </motion.div>
  )
}
