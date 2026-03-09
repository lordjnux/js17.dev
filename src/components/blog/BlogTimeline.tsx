"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Post } from "@/types/blog"

type DayEntry = {
  dayLabel: string  // "Fri 07"
  slug: string
  titleSnip: string // first 17 chars + ellipsis if needed
}

type MonthEntry = {
  month: string
  monthNum: number
  days: DayEntry[]
}

type YearEntry = {
  year: string
  months: MonthEntry[]
}

function buildTimeline(posts: Post[]): YearEntry[] {
  const yearMap = new Map<string, Map<string, { monthNum: number; days: DayEntry[] }>>()

  for (const post of posts) {
    const raw = post.frontmatter.date.split("T")[0]
    const [y, m, d] = raw.split("-").map(Number)
    const date = new Date(y, m - 1, d)
    const year = y.toString()
    const month = date.toLocaleString("en-US", { month: "long" })
    const weekday = date.toLocaleString("en-US", { weekday: "short" })
    const dayNum = d.toString().padStart(2, "0")
    const dayLabel = `${weekday} ${dayNum}`
    const title = post.frontmatter.title
    const titleSnip = title.length > 17 ? title.slice(0, 17) + "…" : title

    if (!yearMap.has(year)) yearMap.set(year, new Map())
    const monthMap = yearMap.get(year)!
    if (!monthMap.has(month)) monthMap.set(month, { monthNum: m, days: [] })
    monthMap.get(month)!.days.push({ dayLabel, slug: post.slug, titleSnip })
  }

  return Array.from(yearMap.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, monthMap]) => ({
      year,
      months: Array.from(monthMap.entries())
        .sort((a, b) => b[1].monthNum - a[1].monthNum)
        .map(([month, { monthNum, days }]) => ({ month, monthNum, days })),
    }))
}

export function BlogTimeline({ posts }: { posts: Post[] }) {
  const timeline = useMemo(() => buildTimeline(posts), [posts])
  const [activeSlug, setActiveSlug] = useState<string>(posts[0]?.slug ?? "")

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const post of posts) {
      const el = document.getElementById(post.slug)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSlug(post.slug) },
        { threshold: 0.2, rootMargin: "-5% 0px -65% 0px" }
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [posts])

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-5 pr-1
        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-border/60 [&::-webkit-scrollbar-track]:bg-transparent">

        <p className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
          Timeline
        </p>

        {timeline.map(({ year, months }) => (
          <div key={year} className="space-y-3">
            {/* Year */}
            <div className="text-[11px] font-bold font-mono text-foreground/70 flex items-center gap-2">
              <span className="inline-block h-px flex-1 bg-border/40" />
              {year}
              <span className="inline-block h-px flex-1 bg-border/40" />
            </div>

            {months.map(({ month, days }) => (
              <div key={month} className="ml-1 space-y-0.5">
                {/* Month */}
                <div className="text-[10px] font-semibold font-mono text-muted-foreground/55 mb-1 pl-2">
                  {month}
                </div>

                {/* Day entries */}
                {days.map(({ dayLabel, slug, titleSnip }) => {
                  const isActive = activeSlug === slug
                  return (
                    <Link
                      key={slug}
                      href={`#${slug}`}
                      scroll={true}
                      className={cn(
                        "ml-2 flex flex-col gap-0.5 rounded-sm px-2 py-1.5 transition-all duration-200",
                        "border-l-2 hover:text-blue-400",
                        isActive
                          ? "border-blue-500 bg-blue-500/8 text-blue-400"
                          : "border-border/30 text-muted-foreground/50 hover:border-blue-500/40 hover:bg-blue-500/5"
                      )}
                    >
                      <span className="text-[9px] font-mono leading-none opacity-75">
                        {dayLabel}
                      </span>
                      <span className="text-[11px] leading-tight font-medium">
                        {titleSnip}
                      </span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}
