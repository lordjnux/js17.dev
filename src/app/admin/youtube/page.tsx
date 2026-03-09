"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ADMIN_EMAIL } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Youtube,
  Loader2,
  CheckCircle,
  X,
  RefreshCw,
  Film,
  Zap,
  Copy,
  ExternalLink,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type JobStep = "idle" | "rendering" | "polling" | "uploading" | "done" | "error"

interface VideoJob {
  step: JobStep
  jobId: string | null
  videoUrl: string | null
  youtubeUrl: string | null
  youtubeTitle: string
  youtubeTags: string[]
  description: string | null
  error: string | null
  descCopied: boolean
}

function freshJob(title: string): VideoJob {
  return {
    step: "idle",
    jobId: null,
    videoUrl: null,
    youtubeUrl: null,
    youtubeTitle: title,
    youtubeTags: [],
    description: null,
    error: null,
    descCopied: false,
  }
}

export default function AdminYoutubePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const [playlistStatus, setPlaylistStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [playlistCreated, setPlaylistCreated] = useState(false)

  const [shortJob, setShortJob] = useState<VideoJob>(freshJob("What Does js17.dev Mean? #Shorts"))
  const [longJob, setLongJob] = useState<VideoJob>(freshJob("js17.dev — The Meaning Behind the Brand"))

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.email !== ADMIN_EMAIL) {
      router.replace("/auth/signin?callbackUrl=/admin/youtube")
    }
  }, [session, status, router])

  async function handleEnsurePlaylist() {
    setPlaylistStatus("loading")
    try {
      const res = await fetch("/api/admin/youtube/ensure-playlist", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlaylistId(data.playlistId)
      setPlaylistCreated(data.created === true)
      setPlaylistStatus("ok")
    } catch (e) {
      setPlaylistStatus("error")
      console.error(e)
    }
  }

  async function generateDescription(
    videoType: "logo-short" | "logo-long",
    youtubeTitle: string,
    youtubeTags: string[]
  ): Promise<string | null> {
    const res = await fetch("/api/admin/youtube/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoType, youtubeTitle, youtubeTags }),
    })
    if (!res.ok) return null
    const { description } = await res.json()
    return description || null
  }

  async function runLogoJob(
    type: "short" | "long",
    setJob: React.Dispatch<React.SetStateAction<VideoJob>>
  ) {
    setJob((j) => ({ ...j, step: "rendering", error: null, videoUrl: null, youtubeUrl: null, description: null }))

    try {
      // Submit render job
      const routeRes = await fetch(`/api/admin/youtube/logo-${type}`, { method: "POST" })
      const routeData = await routeRes.json()
      if (!routeRes.ok) throw new Error(routeData.error)

      const { jobId, youtubeTitle, youtubeTags } = routeData
      setJob((j) => ({ ...j, jobId, youtubeTitle, youtubeTags, step: "polling" }))

      // Poll Shotstack
      let renderedUrl: string | null = null
      for (let i = 0; i < 72; i++) {
        await new Promise((r) => setTimeout(r, 5000))
        const statusRes = await fetch(`/api/admin/video-status/${jobId}`)
        const { status: s, url } = await statusRes.json()
        if (s === "done") { renderedUrl = url; break }
        if (s === "failed") throw new Error("Shotstack render failed")
      }
      if (!renderedUrl) throw new Error("Render timed out")

      setJob((j) => ({ ...j, videoUrl: renderedUrl, step: "uploading" }))

      // Generate description
      const desc = await generateDescription(
        type === "short" ? "logo-short" : "logo-long",
        youtubeTitle,
        youtubeTags
      )
      setJob((j) => ({ ...j, description: desc }))

      // Upload to YouTube
      const uploadRes = await fetch("/api/admin/upload-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: renderedUrl,
          title: youtubeTitle,
          description: desc || "",
          tags: youtubeTags,
          playlistId,
        }),
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error)

      setJob((j) => ({ ...j, youtubeUrl: uploadData.youtubeUrl, step: "done" }))
    } catch (e) {
      setJob((j) => ({ ...j, error: e instanceof Error ? e.message : "Unknown error", step: "error" }))
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Youtube className="h-6 w-6 text-red-500" />
          YouTube Management
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-muted-foreground">Playlist management and brand video publishing</p>
          <Link
            href="/youtube-metrics"
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <BarChart3 className="h-3 w-3" />
            Metrics
          </Link>
        </div>
      </div>

      {/* Playlist section */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">js17.dev Playlist</h2>
            <p className="text-xs text-muted-foreground mt-0.5">All uploaded videos are added to this playlist automatically</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnsurePlaylist}
            disabled={playlistStatus === "loading"}
            className="gap-2"
          >
            {playlistStatus === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {playlistId ? "Verify" : "Create / Verify"}
          </Button>
        </div>

        {playlistStatus === "ok" && playlistId && (
          <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-400">
                {playlistCreated ? "Playlist created" : "Playlist verified"}
              </p>
              <p className="text-xs text-muted-foreground font-mono truncate">ID: {playlistId}</p>
            </div>
            <a
              href={`https://www.youtube.com/playlist?list=${playlistId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {playlistStatus === "error" && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <X className="h-4 w-4 flex-shrink-0" />
            Failed to verify playlist. Check YouTube OAuth token.
          </div>
        )}
      </section>

      {/* Logo Short */}
      <VideoJobCard
        title="Logo Short"
        subtitle="~55s · Vertical 1080×1920 · #Shorts"
        icon={<Zap className="h-4 w-4 text-yellow-400" />}
        job={shortJob}
        onStart={() => runLogoJob("short", setShortJob)}
        onReset={() => setShortJob(freshJob("What Does js17.dev Mean? #Shorts"))}
        onCopyDesc={() => {
          if (shortJob.description) {
            navigator.clipboard.writeText(shortJob.description)
            setShortJob((j) => ({ ...j, descCopied: true }))
            setTimeout(() => setShortJob((j) => ({ ...j, descCopied: false })), 2000)
          }
        }}
      />

      {/* Logo Long */}
      <VideoJobCard
        title="Logo Long Video"
        subtitle="~75s · Horizontal 1280×720 · 62–96 sec"
        icon={<Film className="h-4 w-4 text-blue-400" />}
        job={longJob}
        onStart={() => runLogoJob("long", setLongJob)}
        onReset={() => setLongJob(freshJob("js17.dev — The Meaning Behind the Brand"))}
        onCopyDesc={() => {
          if (longJob.description) {
            navigator.clipboard.writeText(longJob.description)
            setLongJob((j) => ({ ...j, descCopied: true }))
            setTimeout(() => setLongJob((j) => ({ ...j, descCopied: false })), 2000)
          }
        }}
      />
    </main>
  )
}

function VideoJobCard({
  title,
  subtitle,
  icon,
  job,
  onStart,
  onReset,
  onCopyDesc,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  job: VideoJob
  onStart: () => void
  onReset: () => void
  onCopyDesc: () => void
}) {
  const isActive = ["rendering", "polling", "uploading"].includes(job.step)

  const stepLabel: Record<string, string> = {
    rendering: "Generating audio + submitting render…",
    polling: "Rendering video (1–3 min)…",
    uploading: "Uploading to YouTube…",
  }

  return (
    <section className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h2 className="font-semibold text-sm">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {job.step !== "idle" && (
            <Button variant="ghost" size="sm" onClick={onReset} disabled={isActive} className="text-xs gap-1">
              <RefreshCw className="h-3 w-3" /> Reset
            </Button>
          )}
          {job.step === "idle" && (
            <Button size="sm" onClick={onStart} className="gap-2">
              <Youtube className="h-4 w-4" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Active progress */}
      {isActive && (
        <div className="flex items-center gap-3 rounded-lg bg-muted/30 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-blue-400 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{stepLabel[job.step] || job.step}</p>
        </div>
      )}

      {/* Done */}
      {job.step === "done" && job.youtubeUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-400">Published!</p>
              <a
                href={job.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline truncate block"
              >
                {job.youtubeUrl}
              </a>
            </div>
            <a href={job.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {job.description && (
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</span>
                <button
                  onClick={onCopyDesc}
                  className={cn("text-xs transition-colors flex items-center gap-1", job.descCopied ? "text-green-400" : "text-blue-400 hover:text-blue-300")}
                >
                  <Copy className="h-3 w-3" />
                  {job.descCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-32 overflow-auto font-mono leading-relaxed">
                {job.description.slice(0, 400)}…
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {job.step === "error" && job.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {job.error}
        </div>
      )}
    </section>
  )
}
