"use client"

import { motion } from "framer-motion"
import { StravaStatCard } from "./StravaStatCard"
import { RecentActivitiesFeed } from "./RecentActivitiesFeed"
import type { StravaStats } from "@/types/strava"
import { metersToKm, secsToDuration } from "@/lib/strava"
import Link from "next/link"

interface FitWellnessSectionProps {
  stats: StravaStats | null
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const categories = [
  { id: "fitness", label: "Fit & Wellness", icon: "🏃", active: true },
  { id: "music", label: "Music", icon: "🎵", active: false, soon: true },
  { id: "travel", label: "Travel", icon: "✈️", active: false, soon: true },
]

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-orange-500/10 bg-orange-500/5 p-5 h-24"
        />
      ))}
    </div>
  )
}

export function FitWellnessSection({ stats }: FitWellnessSectionProps) {
  return (
    <div className="container-custom py-12 md:py-16 space-y-12">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <motion.div variants={item} className="flex items-center gap-2">
          <span className="inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 uppercase tracking-widest">
            Life Stats
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent"
        >
          Beyond The Code
        </motion.h1>

        <motion.p variants={item} className="text-muted-foreground text-lg max-w-2xl">
          Tracking what keeps me sharp outside the terminal. The same systems thinking I
          apply to distributed architecture — applied to my own performance data.
        </motion.p>

        {stats && (
          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
          >
            <span className="font-medium text-foreground">
              {stats.athlete.firstname} {stats.athlete.lastname}
            </span>
            {stats.athlete.city && <span>·</span>}
            {stats.athlete.city && (
              <span>
                {stats.athlete.city}
                {stats.athlete.country ? `, ${stats.athlete.country}` : ""}
              </span>
            )}
            <span>·</span>
            <span className="flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-orange-500"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Powered by Strava
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* ── Category tabs ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            disabled={!cat.active}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              cat.active
                ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            {cat.soon && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      {!stats ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StravaStatCard
            label="Total Distance"
            value={metersToKm(stats.stats.all_run_totals.distance)}
            subValue={`YTD: ${metersToKm(stats.stats.ytd_run_totals.distance)}`}
            icon="🗺️"
            delay={0}
          />
          <StravaStatCard
            label="Total Runs"
            value={`${stats.stats.all_run_totals.count} runs`}
            subValue={`YTD: ${stats.stats.ytd_run_totals.count} runs`}
            icon="👟"
            delay={0.1}
          />
          <StravaStatCard
            label="Elevation"
            value={`${Math.round(stats.stats.all_run_totals.elevation_gain).toLocaleString()} m`}
            subValue={`YTD: ${Math.round(stats.stats.ytd_run_totals.elevation_gain).toLocaleString()} m`}
            icon="⛰️"
            delay={0.2}
          />
          <StravaStatCard
            label="Current Streak"
            value={`${stats.streaks.current} days`}
            subValue={`Longest: ${stats.streaks.longest} days`}
            icon="🔥"
            delay={0.3}
          />
        </div>
      )}

      {/* ── YTD vs All-Time ──────────────────────────────────────────── */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-xl border border-border/50 bg-card p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-5">
            YTD vs All-Time Running
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">
                This Year
              </div>
              <Stat label="Runs" value={`${stats.stats.ytd_run_totals.count}`} />
              <Stat label="Distance" value={metersToKm(stats.stats.ytd_run_totals.distance)} />
              <Stat
                label="Time"
                value={secsToDuration(stats.stats.ytd_run_totals.moving_time)}
              />
              <Stat
                label="Elevation"
                value={`${Math.round(stats.stats.ytd_run_totals.elevation_gain).toLocaleString()} m`}
              />
            </div>
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                All Time
              </div>
              <Stat label="Runs" value={`${stats.stats.all_run_totals.count}`} />
              <Stat label="Distance" value={metersToKm(stats.stats.all_run_totals.distance)} />
              <Stat
                label="Time"
                value={secsToDuration(stats.stats.all_run_totals.moving_time)}
              />
              <Stat
                label="Elevation"
                value={`${Math.round(stats.stats.all_run_totals.elevation_gain).toLocaleString()} m`}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Recent activities ─────────────────────────────────────────── */}
      {stats && stats.recentActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Runs
          </h2>
          <RecentActivitiesFeed activities={stats.recentActivities} />
        </motion.div>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-8 text-center space-y-4"
      >
        <p className="text-muted-foreground">
          This site auto-integrates everything I track — APIs, crons, blob caches, live data.
          <br className="hidden sm:block" />
          The same engineering discipline that builds your systems.
        </p>
        <Link
          href="/proposal"
          className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-6 py-2.5 text-sm font-semibold text-orange-400 hover:bg-orange-500/20 transition-colors"
        >
          Ask me how →
        </Link>
      </motion.div>

      {/* ── Last cached timestamp ─────────────────────────────────────── */}
      {stats && (
        <p className="text-center text-xs text-muted-foreground/50">
          Stats cached · {new Date(stats.cachedAt).toLocaleString()}
        </p>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
