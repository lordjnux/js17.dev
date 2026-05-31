"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CVDownloadButton } from "@/components/shared/CVDownloadButton"
import { useTranslations } from "next-intl"

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
  const t = useTranslations("home")

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
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
          <motion.div variants={item} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {t("availableBadge")}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance"
          >
            {t("heroTitle1")}{" "}
            <span className="gradient-text">{t("heroHighlight")}</span>
            {t("heroTitle2") && (
              <>
                <br />
                {t("heroTitle2")}
              </>
            )}
            {t("heroTitle3") && (
              <>
                <br />
                {t("heroTitle3")}
              </>
            )}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
          >
            {t("heroTagline")}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button size="xl" asChild className="group">
              <Link href="/proposal">
                <Sparkles className="mr-2 h-5 w-5" />
                {t("requestProposal")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <CVDownloadButton size="xl" variant="outline" />

            <Button size="xl" variant="ghost" asChild>
              <a
                href="https://calendar.app.google/L4g1EYk1EUQpDWGK9"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="mr-2 h-5 w-5" />
                {t("scheduleCall")}
              </a>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-16 flex flex-wrap gap-8"
          >
            {([
              { key: "yearsExperience", value: "10+" },
              { key: "projectsShipped", value: "50+" },
              { key: "uptimeSLA", value: "99.9%" },
              { key: "aiSystemsBuilt", value: "15+" },
            ] as const).map((stat) => (
              <div key={stat.key}>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{t(`stats.${stat.key}`)}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
