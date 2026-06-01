"use client"

import { useMemo } from "react"
import type { StravaActivity } from "@/types/strava"

interface Props {
  activities: StravaActivity[]
}

const SPORT_COLORS: Record<string, string> = {
  Run: "#FC4C02",
  TrailRun: "#E85200",
  VirtualRun: "#FF7A50",
  Ride: "#3B82F6",
  VirtualRide: "#60A5FA",
  EBikeRide: "#93C5FD",
  Swim: "#06B6D4",
  Walk: "#22C55E",
  Hike: "#16A34A",
  Workout: "#A855F7",
  default: "#6366F1",
}

function getSportColor(sportType: string, type: string) {
  return SPORT_COLORS[sportType] ?? SPORT_COLORS[type] ?? SPORT_COLORS.default
}

export function ActivityCalendar({ activities }: Props) {
  const { weeks, months } = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const start = new Date(now)
    start.setDate(start.getDate() - 51 * 7 - start.getDay())

    // Build activity map: date string → array of activities
    const dayMap = new Map<string, StravaActivity[]>()
    for (const a of activities) {
      const key = a.start_date_local.substring(0, 10)
      const existing = dayMap.get(key) ?? []
      dayMap.set(key, [...existing, a])
    }

    const weeks: Array<Array<{ date: string; acts: StravaActivity[] }>> = []
    const monthLabels: Array<{ label: string; col: number }> = []
    const current = new Date(start)
    let lastMonth = -1

    for (let w = 0; w < 52; w++) {
      const week: Array<{ date: string; acts: StravaActivity[] }> = []
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().substring(0, 10)
        if (current.getMonth() !== lastMonth) {
          lastMonth = current.getMonth()
          monthLabels.push({
            label: current.toLocaleDateString("en-US", { month: "short" }),
            col: w,
          })
        }
        week.push({ date: dateStr, acts: dayMap.get(dateStr) ?? [] })
        current.setDate(current.getDate() + 1)
      }
      weeks.push(week)
    }

    return { weeks, months: monthLabels }
  }, [activities])

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 overflow-x-auto">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Activity Calendar
      </h2>

      <div className="relative">
        {/* Month labels */}
        <div className="flex mb-1" style={{ paddingLeft: 20 }}>
          {months.map((m) => (
            <div
              key={`${m.label}-${m.col}`}
              className="absolute text-[10px] text-muted-foreground/60"
              style={{ left: 20 + m.col * 13 }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5 mt-4">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {["", "M", "", "W", "", "F", ""].map((label, i) => (
              <div key={i} className="h-[11px] w-4 text-[9px] text-muted-foreground/50 flex items-center">
                {label}
              </div>
            ))}
          </div>

          {/* Cells */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map(({ date, acts }) => {
                const mainAct = acts[0]
                const bg = mainAct ? getSportColor(mainAct.sport_type, mainAct.type) : undefined
                const opacity = acts.length > 0
                  ? Math.min(0.3 + acts.length * 0.25, 1)
                  : 0

                return (
                  <div
                    key={date}
                    title={
                      acts.length > 0
                        ? acts.map((a) => `${a.sport_type || a.type}: ${(a.distance / 1000).toFixed(1)}km`).join("\n")
                        : date
                    }
                    className="h-[11px] w-[11px] rounded-[2px] cursor-default transition-transform hover:scale-125"
                    style={{
                      backgroundColor: bg ?? "transparent",
                      opacity: acts.length > 0 ? opacity : 1,
                      border: acts.length === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries({
            Run: "#FC4C02",
            Ride: "#3B82F6",
            Swim: "#06B6D4",
            Walk: "#22C55E",
            Other: "#6366F1",
          }).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-muted-foreground/60">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
