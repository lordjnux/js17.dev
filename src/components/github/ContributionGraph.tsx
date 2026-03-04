"use client"

import { ContributionData } from "@/types/github"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ContributionGraphProps {
  data: ContributionData
}

const LEVEL_COLORS = {
  0: "bg-muted/50",
  1: "bg-blue-500/20",
  2: "bg-blue-500/40",
  3: "bg-blue-500/70",
  4: "bg-blue-500",
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function ContributionGraph({ data }: ContributionGraphProps) {
  if (!data.weeks.length) return null

  // Build month labels
  const monthLabels: { label: string; weekIndex: number }[] = []
  data.weeks.forEach((week, weekIndex) => {
    const firstDay = week.days[0]
    if (firstDay) {
      const date = new Date(firstDay.date)
      if (date.getDate() <= 7) {
        monthLabels.push({ label: MONTHS[date.getMonth()], weekIndex })
      }
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Contributions
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {data.totalContributions.toLocaleString()} in the last year
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Month labels */}
          <div className="relative mb-1 ml-8">
            <div className="flex gap-[3px]">
              {data.weeks.map((_, weekIndex) => {
                const label = monthLabels.find((m) => m.weekIndex === weekIndex)
                return (
                  <div key={weekIndex} className="w-[10px] flex-shrink-0">
                    {label && (
                      <span className="absolute text-[10px] text-muted-foreground -translate-x-1/2">
                        {label.label}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1">
              {DAYS.map((day, i) => (
                <div key={day} className="h-[10px] w-6 flex items-center">
                  {i % 2 === 1 && (
                    <span className="text-[9px] text-muted-foreground">{day}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-[3px]">
              {data.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.days.map((day) => (
                    <div
                      key={day.date}
                      className={`h-[10px] w-[10px] rounded-sm ${LEVEL_COLORS[day.level]} cursor-pointer transition-opacity hover:opacity-80`}
                      title={`${day.count} contributions on ${day.date}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-2 justify-end">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-[10px] w-[10px] rounded-sm ${LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]}`}
              />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
