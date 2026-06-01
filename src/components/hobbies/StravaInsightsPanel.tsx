"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, TrendingUp, TrendingDown, Minus, CheckCircle, Lightbulb } from "lucide-react"
import type { StravaAIInsights } from "@/types/strava"

export function StravaInsightsPanel() {
  const [insights, setInsights] = useState<StravaAIInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/strava/insights")
      .then((r) => r.json())
      .then((data) => { setInsights(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-6 animate-pulse space-y-3">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-16 w-full rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 rounded bg-muted" />
          <div className="h-24 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!insights) return null

  const TrendIcon =
    insights.weeklyTrend === "improving"
      ? TrendingUp
      : insights.weeklyTrend === "declining"
      ? TrendingDown
      : Minus

  const trendColor =
    insights.weeklyTrend === "improving"
      ? "text-green-400"
      : insights.weeklyTrend === "declining"
      ? "text-red-400"
      : "text-yellow-400"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-orange-400">
            AI Performance Insights
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <span className={`text-xs font-semibold capitalize ${trendColor}`}>
            {insights.weeklyTrend}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>

      {/* Strengths + Suggestions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-400 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            Strengths
          </p>
          <ul className="space-y-1.5">
            {insights.strengths.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                <span className="text-green-400 flex-shrink-0 mt-0.5">›</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" />
            Suggestions
          </p>
          <ul className="space-y-1.5">
            {insights.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                <span className="text-amber-400 flex-shrink-0 mt-0.5">›</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground/50 text-right">
        Powered by GPT-4o-mini · Analyzed{" "}
        {new Date(insights.generatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </motion.div>
  )
}
