"use client"

import { motion } from "framer-motion"
import type { StravaActivity, StravaAthleteStats } from "@/types/strava"
import { metersToKm, secsToDuration } from "@/lib/strava"

interface Props {
  activities: StravaActivity[]
  stats: StravaAthleteStats
}

interface SportConfig {
  label: string
  icon: string
  color: string
  bg: string
  unit: (dist: number) => string
}

const SPORT_CONFIG: Record<string, SportConfig> = {
  Run: {
    label: "Running",
    icon: "🏃",
    color: "#FC4C02",
    bg: "border-orange-500/20 bg-orange-500/5",
    unit: metersToKm,
  },
  Ride: {
    label: "Cycling",
    icon: "🚴",
    color: "#3B82F6",
    bg: "border-blue-500/20 bg-blue-500/5",
    unit: metersToKm,
  },
  Swim: {
    label: "Swimming",
    icon: "🏊",
    color: "#06B6D4",
    bg: "border-cyan-500/20 bg-cyan-500/5",
    unit: (m) => `${(m / 1000).toFixed(2)} km`,
  },
  Walk: {
    label: "Walking",
    icon: "🚶",
    color: "#22C55E",
    bg: "border-green-500/20 bg-green-500/5",
    unit: metersToKm,
  },
  Hike: {
    label: "Hiking",
    icon: "🥾",
    color: "#16A34A",
    bg: "border-green-600/20 bg-green-600/5",
    unit: metersToKm,
  },
}

const CANONICAL: Record<string, string> = {
  TrailRun: "Run",
  VirtualRun: "Run",
  VirtualRide: "Ride",
  EBikeRide: "Ride",
  MountainBikeRide: "Ride",
  GravelRide: "Ride",
  Workout: "Workout",
}

function canonicalize(sportType: string, type: string): string {
  return CANONICAL[sportType] ?? CANONICAL[type] ?? sportType ?? type
}

export function MultiSportStats({ activities, stats }: Props) {
  // Aggregate by canonical sport
  const sportTotals: Record<string, { count: number; distance: number; movingTime: number }> = {}

  for (const a of activities) {
    const key = canonicalize(a.sport_type, a.type)
    if (!sportTotals[key]) sportTotals[key] = { count: 0, distance: 0, movingTime: 0 }
    sportTotals[key].count++
    sportTotals[key].distance += a.distance
    sportTotals[key].movingTime += a.moving_time
  }

  // Sorted by activity count desc, limited to known sports
  const displayed = Object.entries(sportTotals)
    .filter(([key]) => SPORT_CONFIG[key])
    .sort((a, b) => b[1].count - a[1].count)

  if (displayed.length === 0) return null

  // All-time run totals from stats endpoint
  const allTimeRuns = stats.all_run_totals
  const ytdRuns = stats.ytd_run_totals

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Multi-Sport Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayed.map(([sport, totals], i) => {
          const cfg = SPORT_CONFIG[sport]
          return (
            <motion.div
              key={sport}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`rounded-xl border p-5 ${cfg.bg}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cfg.icon}</span>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Activities</span>
                  <span className="font-semibold tabular-nums">{totals.count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-semibold tabular-nums">{cfg.unit(totals.distance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-semibold tabular-nums">{secsToDuration(totals.movingTime)}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* All-time running deep stats (from athlete stats endpoint) */}
      {allTimeRuns.count > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-6 mt-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Running — YTD vs All-Time
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest">This Year</p>
              <Stat label="Runs" value={`${ytdRuns.count}`} />
              <Stat label="Distance" value={metersToKm(ytdRuns.distance)} />
              <Stat label="Time" value={secsToDuration(ytdRuns.moving_time)} />
              <Stat label="Elevation" value={`${Math.round(ytdRuns.elevation_gain).toLocaleString()} m`} />
            </div>
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">All Time</p>
              <Stat label="Runs" value={`${allTimeRuns.count}`} />
              <Stat label="Distance" value={metersToKm(allTimeRuns.distance)} />
              <Stat label="Time" value={secsToDuration(allTimeRuns.moving_time)} />
              <Stat label="Elevation" value={`${Math.round(allTimeRuns.elevation_gain).toLocaleString()} m`} />
            </div>
          </div>
        </div>
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
