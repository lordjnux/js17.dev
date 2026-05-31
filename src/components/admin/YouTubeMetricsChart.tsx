"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Youtube, TrendingUp } from "lucide-react"

interface VideoMetric {
  slug: string
  format: "short" | "long"
  youtubeUrl: string
  videoId: string
  stats: { viewCount: number; likeCount: number; commentCount: number } | null
}

interface MetricsResponse {
  videos: VideoMetric[]
  totals: { videos: number; shorts: number; longs: number; views: number; likes: number; comments: number }
  lastUpdated: string
}

export function YouTubeMetricsChart() {
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/youtube/metrics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Youtube className="h-4 w-4 text-red-500" />
          <h2 className="font-semibold text-sm">YouTube Metrics</h2>
        </div>
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </div>
    )
  }

  if (!data || data.videos.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Youtube className="h-4 w-4 text-red-500" />
          <h2 className="font-semibold text-sm">YouTube Metrics</h2>
        </div>
        <p className="text-sm text-muted-foreground">No videos published yet.</p>
      </div>
    )
  }

  const chartData = data.videos
    .filter((v) => v.stats)
    .map((v) => ({
      name: v.slug.replace(/-/g, " ").slice(0, 22) + (v.slug.length > 22 ? "…" : ""),
      views: v.stats!.viewCount,
      format: v.format,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-500" />
          <h2 className="font-semibold text-sm">YouTube Metrics</h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {data.totals.views.toLocaleString()} total views
          </span>
          <span>{data.videos.length} videos</span>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="views" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.format === "short" ? "#06b6d4" : "#6366f1"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" />
          Shorts
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
          Long form
        </span>
      </div>
    </div>
  )
}
