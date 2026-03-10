"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Youtube,
  Loader2,
  CheckCircle,
  X,
  Sparkles,
  Film,
  Upload,
  ExternalLink,
  Copy,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ADMIN_EMAIL } from "@/lib/auth"

type Format = "short" | "long"

type Step =
  | "idle"
  | "published"
  | "generating-script"
  | "script-ready"
  | "generating-audio"
  | "composing"
  | "rendering"
  | "ready"
  | "uploading"
  | "done"
  | "error"

interface VisualItem { icon: string; label: string }

interface Slide {
  type?: string
  icon?: string
  title: string
  visual?: VisualItem[]
  bullets?: string[]
  narration: string
  estimatedDuration: number
  chapterNumber?: number
  columnA?: { heading: string; items: VisualItem[] }
  columnB?: { heading: string; items: VisualItem[] }
  codeLines?: string[]
}

interface Script {
  youtubeTitle: string
  youtubeDescription: string
  youtubeTags: string[]
  estimatedDuration: number
  chapterTitles?: Array<{ slideIndex: number; label: string }>
  slides: Slide[]
}

interface FormatJob {
  step: Step
  script: Script | null
  videoUrl: string | null
  youtubeUrl: string | null
  description: string | null
  error: string | null
  progress: string
  descCopied: boolean
}

function freshJob(): FormatJob {
  return { step: "idle", script: null, videoUrl: null, youtubeUrl: null, description: null, error: null, progress: "", descCopied: false }
}

function publishedJob(youtubeUrl: string): FormatJob {
  return { ...freshJob(), step: "published", youtubeUrl }
}

export function PublishVideoButton({ slug }: { slug: string }) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const [statusLoaded, setStatusLoaded] = useState(false)
  const [shortJob, setShortJob] = useState<FormatJob>(freshJob())
  const [longJob, setLongJob] = useState<FormatJob>(freshJob())

  if (!session || session.user?.email !== ADMIN_EMAIL) return null

  const setter = (format: Format) => format === "short" ? setShortJob : setLongJob
  const getter = (format: Format) => format === "short" ? shortJob : longJob

  async function handleOpen() {
    setOpen(true)
    // Load published state once
    if (!statusLoaded) {
      setStatusLoaded(true)
      try {
        const res = await fetch(`/api/admin/youtube/article-status?slug=${encodeURIComponent(slug)}`)
        if (res.ok) {
          const { short, long } = await res.json()
          if (short?.youtubeUrl) setShortJob(publishedJob(short.youtubeUrl))
          if (long?.youtubeUrl) setLongJob(publishedJob(long.youtubeUrl))
        }
      } catch {}
      // Ensure playlist (non-blocking)
      try {
        const res = await fetch("/api/admin/youtube/ensure-playlist", { method: "POST" })
        if (res.ok) {
          const data = await res.json()
          if (data.playlistId) setPlaylistId(data.playlistId)
        }
      } catch {}
    }
  }

  async function generateScript(format: Format) {
    const set = setter(format)
    set((j) => ({ ...j, step: "generating-script", error: null }))
    try {
      const res = await fetch("/api/admin/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, videoFormat: format }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const script: Script = await res.json()
      set((j) => ({ ...j, script, step: "script-ready" }))
    } catch (e) {
      set((j) => ({ ...j, error: e instanceof Error ? e.message : "Script generation failed", step: "error" }))
    }
  }

  async function fetchStockImages(slug: string, format: Format): Promise<string[]> {
    try {
      const res = await fetch("/api/admin/fetch-stock-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, videoFormat: format }),
      })
      if (!res.ok) return []
      const { images } = await res.json()
      return images || []
    } catch {
      return []
    }
  }

  async function generateVideo(format: Format, script: Script) {
    const set = setter(format)
    try {
      // 1. Fetch background images (non-blocking, best-effort)
      const backgroundImages = await fetchStockImages(slug, format).catch(() => [])

      // 2. Per-slide audio (ElevenLabs with OpenAI fallback)
      set((j) => ({ ...j, step: "generating-audio", progress: "Generating per-slide audio (ElevenLabs)… may take 30-60s" }))
      const audioRes = await fetch("/api/admin/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: script.slides.map((s, i) => ({ narration: s.narration, slideIndex: i })),
          videoFormat: format,
        }),
      })
      if (!audioRes.ok) throw new Error((await audioRes.json()).error)
      const { audioSlides, totalDuration } = await audioRes.json()

      // 3. Compose (Shotstack render job)
      set((j) => ({ ...j, step: "composing", progress: "Assembling slides + audio with Shotstack…" }))
      const composeRes = await fetch("/api/admin/compose-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: script.slides,
          audioSlides,
          totalDuration,
          videoFormat: format,
          backgroundImages,
        }),
      })
      if (!composeRes.ok) throw new Error((await composeRes.json()).error)
      const { jobId } = await composeRes.json()

      // 4. Poll
      set((j) => ({ ...j, step: "rendering", progress: "Rendering video (1–3 min)…" }))
      let renderedUrl: string | null = null
      for (let i = 0; i < 72; i++) {
        await new Promise((r) => setTimeout(r, 5000))
        const statusRes = await fetch(`/api/admin/video-status/${jobId}`)
        const { status, url } = await statusRes.json()
        if (status === "done") { renderedUrl = url; break }
        if (status === "failed") throw new Error("Shotstack render failed")
        set((j) => ({ ...j, progress: `Rendering… (${status})` }))
      }
      if (!renderedUrl) throw new Error("Render timed out after 6 minutes")

      // 5. Generate description (with chapter timestamps)
      const descRes = await fetch("/api/admin/youtube/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoType: "article",
          slug,
          slides: script.slides.map((s) => ({ title: s.title, estimatedDuration: s.estimatedDuration })),
          youtubeTitle: script.youtubeTitle,
          youtubeTags: script.youtubeTags,
          chapterTitles: script.chapterTitles,
        }),
      })
      const description = descRes.ok ? ((await descRes.json()).description ?? null) : null

      set((j) => ({ ...j, videoUrl: renderedUrl, description, step: "ready" }))
    } catch (e) {
      set((j) => ({ ...j, error: e instanceof Error ? e.message : "Video generation failed", step: "error" }))
    }
  }

  async function publishToYoutube(format: Format) {
    const set = setter(format)
    const job = getter(format)
    if (!job.videoUrl || !job.script) return
    set((j) => ({ ...j, step: "uploading", progress: "Uploading to YouTube…" }))
    try {
      const res = await fetch("/api/admin/upload-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: job.videoUrl,
          title: job.script.youtubeTitle,
          description: job.description || job.script.youtubeDescription,
          tags: job.script.youtubeTags,
          playlistId,
          slug,
          videoFormat: format,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const { youtubeUrl } = await res.json()
      set((j) => ({ ...j, youtubeUrl, step: "done" }))
    } catch (e) {
      set((j) => ({ ...j, error: e instanceof Error ? e.message : "YouTube upload failed", step: "error" }))
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
        onClick={handleOpen}
      >
        <Youtube className="h-4 w-4" />
        Publish to YouTube
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-card shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                  <Youtube className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Publish to YouTube</h2>
                  <p className="text-xs text-muted-foreground font-mono">{slug}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <FormatCard
                format="short"
                label="YouTube Short"
                subtitle="Vertical 1080×1920 · ~55–60 s · #Shorts"
                icon={<Zap className="h-3.5 w-3.5 text-yellow-400" />}
                job={shortJob}
                onStart={() => generateScript("short")}
                onGenerateVideo={(script) => generateVideo("short", script)}
                onPublish={() => publishToYoutube("short")}
                onReset={() => setShortJob(freshJob())}
                onCopyDesc={() => {
                  if (shortJob.description) {
                    navigator.clipboard.writeText(shortJob.description)
                    setShortJob((j) => ({ ...j, descCopied: true }))
                    setTimeout(() => setShortJob((j) => ({ ...j, descCopied: false })), 2000)
                  }
                }}
              />
              <FormatCard
                format="long"
                label="YouTube Video"
                subtitle="Horizontal 1280×720 · 6–10 min"
                icon={<Film className="h-3.5 w-3.5 text-blue-400" />}
                job={longJob}
                onStart={() => generateScript("long")}
                onGenerateVideo={(script) => generateVideo("long", script)}
                onPublish={() => publishToYoutube("long")}
                onReset={() => setLongJob(freshJob())}
                onCopyDesc={() => {
                  if (longJob.description) {
                    navigator.clipboard.writeText(longJob.description)
                    setLongJob((j) => ({ ...j, descCopied: true }))
                    setTimeout(() => setLongJob((j) => ({ ...j, descCopied: false })), 2000)
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FormatCard({
  label,
  subtitle,
  icon,
  job,
  onStart,
  onGenerateVideo,
  onPublish,
  onReset,
  onCopyDesc,
}: {
  format: Format
  label: string
  subtitle: string
  icon: React.ReactNode
  job: FormatJob
  onStart: () => void
  onGenerateVideo: (script: Script) => void
  onPublish: () => void
  onReset: () => void
  onCopyDesc: () => void
}) {
  const isActive = ["generating-script", "generating-audio", "composing", "rendering", "uploading"].includes(job.step)

  const progressLabel: Record<string, string> = {
    "generating-script": "GPT-4o writing script…",
    "generating-audio": job.progress || "Generating per-slide audio (ElevenLabs)… may take 30-60s",
    "composing": job.progress || "Assembling video…",
    "rendering": job.progress || "Rendering (1–3 min)…",
    "uploading": "Uploading to YouTube…",
  }

  return (
    <section className="rounded-xl border bg-muted/10 p-5 space-y-3">
      {/* Card header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h3 className="font-semibold text-sm">{label}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {job.step !== "idle" && job.step !== "published" && (
            <Button variant="ghost" size="sm" onClick={onReset} disabled={isActive} className="h-7 px-2 text-xs">
              Reset
            </Button>
          )}
          {job.step === "idle" && (
            <Button size="sm" onClick={onStart} className="gap-1.5 h-8">
              <Sparkles className="h-3.5 w-3.5" />
              Generate Script
            </Button>
          )}
        </div>
      </div>

      {/* Published / Done */}
      {(job.step === "published" || job.step === "done") && job.youtubeUrl && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5">
          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-400">Published</p>
            <a href={job.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline truncate block">
              {job.youtubeUrl}
            </a>
          </div>
          <a href={job.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Active progress */}
      {isActive && (
        <div className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-blue-400 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{progressLabel[job.step]}</p>
        </div>
      )}

      {/* Script ready — review & confirm */}
      {job.step === "script-ready" && job.script && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">YouTube Title</p>
            <p className="text-sm font-medium">{job.script.youtubeTitle}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.script.slides.map((s, i) => (
              <span key={i} className="rounded border bg-card px-2 py-0.5 text-xs text-muted-foreground">
                {i + 1}. {s.title.slice(0, 28)}{s.title.length > 28 ? "…" : ""}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {job.script.slides.length} slides · ~{Math.round(job.script.estimatedDuration / 60)} min
          </p>
          <Button className="w-full gap-2 h-9" onClick={() => onGenerateVideo(job.script!)}>
            <Upload className="h-4 w-4" />
            Generate Video
          </Button>
        </div>
      )}

      {/* Ready to publish */}
      {job.step === "ready" && job.videoUrl && (
        <div className="space-y-3">
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-green-400">Video rendered</p>
              <a href={job.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline">
                Preview ↗
              </a>
            </div>
          </div>

          {job.description && (
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</span>
                <button
                  onClick={onCopyDesc}
                  className={cn("text-xs flex items-center gap-1 transition-colors", job.descCopied ? "text-green-400" : "text-blue-400 hover:text-blue-300")}
                >
                  <Copy className="h-3 w-3" />
                  {job.descCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-24 overflow-auto font-mono leading-relaxed">
                {job.description.slice(0, 350)}…
              </pre>
            </div>
          )}

          <Button className="w-full gap-2 h-9 bg-red-600 hover:bg-red-700 text-white" onClick={onPublish}>
            <Youtube className="h-4 w-4" />
            Publish to YouTube
          </Button>
        </div>
      )}

      {/* Error */}
      {job.step === "error" && job.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {job.error}
        </div>
      )}
    </section>
  )
}
