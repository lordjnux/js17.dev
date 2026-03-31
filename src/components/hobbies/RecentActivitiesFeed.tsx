"use client"

import { useEffect, useRef, useState } from "react"
import type { StravaActivity } from "@/types/strava"
import { metersToKm, secsToPace, secsToDuration, formatDate } from "@/lib/strava"

interface RecentActivitiesFeedProps {
  activities: StravaActivity[]
}

function useReveal() {
  const ref = useRef<HTMLTableRowElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}

function ActivityRow({
  activity,
  index,
}: {
  activity: StravaActivity
  index: number
}) {
  const { ref, visible } = useReveal()

  return (
    <tr
      ref={ref}
      className="border-b border-border/50 hover:bg-orange-500/5 hover:border-l-2 hover:border-l-orange-500 transition-all group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.4s ease ${index * 50}ms, transform 0.4s ease ${index * 50}ms`,
      }}
    >
      <td className="py-3 pr-4 text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(activity.start_date_local)}
      </td>
      <td className="py-3 pr-4 text-sm font-medium max-w-[180px] truncate">
        {activity.name}
      </td>
      <td className="py-3 pr-4 text-sm text-orange-400 tabular-nums whitespace-nowrap">
        {metersToKm(activity.distance)}
      </td>
      <td className="py-3 pr-4 text-sm text-muted-foreground tabular-nums whitespace-nowrap">
        {secsToPace(activity.average_speed)}
      </td>
      <td className="py-3 text-sm text-muted-foreground tabular-nums whitespace-nowrap">
        {secsToDuration(activity.moving_time)}
      </td>
    </tr>
  )
}

export function RecentActivitiesFeed({ activities }: RecentActivitiesFeedProps) {
  const recent = activities.slice(0, 10)

  if (recent.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No recent activities recorded.</p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="py-3 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Date
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Activity
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Distance
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Pace
            </th>
            <th className="py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Duration
            </th>
          </tr>
        </thead>
        <tbody>
          {recent.map((activity, i) => (
            <ActivityRow key={activity.id} activity={activity} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
