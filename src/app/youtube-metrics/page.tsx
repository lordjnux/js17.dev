"use client"

import { useEffect, useState } from "react"
import {
  Youtube,
  BarChart3,
  Eye,
  ThumbsUp,
  MessageSquare,
  Zap,
  Film,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoStats {
  viewCount: number
  likeCount: number
  commentCount: number
}

interface VideoMetric {
  slug: string
  format: string
  youtubeUrl: string
  videoId: string
  publishedAt: string
  stats: VideoStats | null
}

interface Totals {
  videos: number
  shorts: number
  longs: number
  views: number
  likes: number
  comments: number
}

export default function YouTubeMetricsPage() {
  const [videos, setVideos] = useState<VideoMetric[]>([])
  const [totals, setTotals] = useState<Totals>({ videos: 0, shorts: 0, longs: 0, views: 0, likes: 0, comments: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/youtube/metrics")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load metrics")
        const data = await res.json()
        setVideos(data.videos)
        setTotals(data.totals)
        setLastUpdated(data.lastUpdated)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const shortVideos = videos.filter((v) => v.format === "short")
  const longVideos = videos.filter((v) => v.format === "long")
  const uniqueSlugs = new Set(videos.map((v) => v.slug)).size

  return (
    <div className="container-custom py-12 md:py-16 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
              <Youtube className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">YouTube Metrics</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Live performance stats for all published videos
              </p>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground hidden sm:block pt-1 text-right">
              Last updated<br />
              {new Date(lastUpdated).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <StatCard icon={<Youtube className="h-4 w-4" />} label="Total Videos" value={totals.videos} color="red" />
            <StatCard icon={<Zap className="h-4 w-4" />} label="Shorts" value={totals.shorts} color="yellow" />
            <StatCard icon={<Film className="h-4 w-4" />} label="Long Videos" value={totals.longs} color="blue" />
            <StatCard icon={<Eye className="h-4 w-4" />} label="Total Views" value={totals.views} color="green" />
            <StatCard icon={<ThumbsUp className="h-4 w-4" />} label="Total Likes" value={totals.likes} color="purple" />
            <StatCard icon={<MessageSquare className="h-4 w-4" />} label="Comments" value={totals.comments} color="orange" />
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                Shorts ({shortVideos.length})
              </h3>
              {shortVideos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No shorts published yet</p>
              ) : (
                <div className="space-y-2">
                  {shortVideos.map((v) => (
                    <VideoRow key={`${v.slug}-${v.format}`} video={v} />
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Film className="h-4 w-4 text-blue-400" />
                Long Videos ({longVideos.length})
              </h3>
              {longVideos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No long videos published yet</p>
              ) : (
                <div className="space-y-2">
                  {longVideos.map((v) => (
                    <VideoRow key={`${v.slug}-${v.format}`} video={v} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full Table */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold">All Published Videos</h3>
                <p className="text-xs text-muted-foreground">
                  {totals.videos} videos across {uniqueSlugs} article{uniqueSlugs !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {videos.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                No videos published yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Article</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Format</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Views</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Likes</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Comments</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Published</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((v, i) => (
                      <tr
                        key={`${v.slug}-${v.format}`}
                        className={cn("border-b last:border-0", i % 2 === 0 ? "bg-transparent" : "bg-muted/10")}
                      >
                        <td className="px-4 py-3 font-medium max-w-[200px] truncate" title={v.slug}>
                          {v.slug}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                              v.format === "short"
                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            )}
                          >
                            {v.format === "short" ? <Zap className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                            {v.format === "short" ? "Short" : "Long"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {v.stats ? v.stats.viewCount.toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {v.stats ? v.stats.likeCount.toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {v.stats ? v.stats.commentCount.toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {new Date(v.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <a
                            href={v.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: "red" | "yellow" | "blue" | "green" | "purple" | "orange"
}) {
  const colors = {
    red: "border-red-500/20 bg-red-500/5 text-red-400",
    yellow: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400",
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    green: "border-green-500/20 bg-green-500/5 text-green-400",
    purple: "border-purple-500/20 bg-purple-500/5 text-purple-400",
    orange: "border-orange-500/20 bg-orange-500/5 text-orange-400",
  }
  return (
    <div className={cn("rounded-xl border p-4 text-center", colors[color])}>
      <div className="flex items-center justify-center mb-2 opacity-80">{icon}</div>
      <div className="text-2xl font-bold font-mono">{value.toLocaleString()}</div>
      <div className="text-[11px] mt-1 opacity-70">{label}</div>
    </div>
  )
}

function VideoRow({ video }: { video: VideoMetric }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/10 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{video.slug}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          {video.stats ? (
            <>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {video.stats.viewCount}</span>
              <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {video.stats.likeCount}</span>
              <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {video.stats.commentCount}</span>
            </>
          ) : (
            <span>Stats unavailable</span>
          )}
        </div>
      </div>
      <a
        href={video.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground flex-shrink-0"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
