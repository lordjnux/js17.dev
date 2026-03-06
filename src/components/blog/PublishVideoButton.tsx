"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Youtube, Loader2, CheckCircle, ChevronRight, X, Sparkles, Mic, Film, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { ADMIN_EMAIL } from "@/lib/auth"

interface Slide {
  title: string
  bullets: string[]
  narration: string
  estimatedDuration: number
}

interface Script {
  youtubeTitle: string
  youtubeDescription: string
  youtubeTags: string[]
  estimatedDuration: number
  slides: Slide[]
}

type Step = "idle" | "generating-script" | "script-ready" | "generating-audio" | "composing" | "rendering" | "ready" | "uploading" | "done" | "error"

export function PublishVideoButton({ slug }: { slug: string }) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("idle")
  const [script, setScript] = useState<Script | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState("")
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [descCopied, setDescCopied] = useState(false)

  // Only show for admin
  if (!session || session.user?.email !== ADMIN_EMAIL) return null

  async function handleGenerateScript() {
    setStep("generating-script")
    setError(null)
    try {
      // Ensure playlist exists (non-blocking — don't fail if YouTube auth missing)
      const plRes = await fetch("/api/admin/youtube/ensure-playlist", { method: "POST" })
      if (plRes.ok) {
        const plData = await plRes.json()
        if (plData.playlistId) setPlaylistId(plData.playlistId)
      }

      const res = await fetch("/api/admin/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const data: Script = await res.json()
      setScript(data)
      setStep("script-ready")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate script")
      setStep("error")
    }
  }

  async function handleGenerateVideo() {
    if (!script) return
    setError(null)

    try {
      // Step 1: Generate audio
      setStep("generating-audio")
      setProgress("Generating narration audio with OpenAI TTS (onyx voice)…")
      const combinedNarration = script.slides.map((s) => s.narration).join("\n\n")
      const audioRes = await fetch("/api/admin/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narration: combinedNarration }),
      })
      if (!audioRes.ok) throw new Error((await audioRes.json()).error)
      const { url: audioUrl } = await audioRes.json()

      // Step 2: Submit Shotstack render job
      setStep("composing")
      setProgress("Assembling slides + audio with Shotstack…")
      const composeRes = await fetch("/api/admin/compose-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: script.slides,
          audioUrl,
          totalDuration: script.estimatedDuration,
        }),
      })
      if (!composeRes.ok) throw new Error((await composeRes.json()).error)
      const { jobId } = await composeRes.json()

      // Step 3: Poll for completion
      setStep("rendering")
      setProgress("Rendering video (this takes 1-3 minutes)…")
      let renderedUrl: string | null = null
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 5000))
        const statusRes = await fetch(`/api/admin/video-status/${jobId}`)
        const { status, url } = await statusRes.json()
        if (status === "done") { renderedUrl = url; break }
        if (status === "failed") throw new Error("Shotstack render failed")
        setProgress(`Rendering video… (${status})`)
      }

      if (!renderedUrl) throw new Error("Render timed out after 5 minutes")
      setVideoUrl(renderedUrl)

      // Generate full YouTube description
      if (script) {
        const descRes = await fetch("/api/admin/youtube/generate-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoType: "article",
            slug,
            slides: script.slides.map((s) => ({ title: s.title, estimatedDuration: s.estimatedDuration })),
            youtubeTitle: script.youtubeTitle,
            youtubeTags: script.youtubeTags,
          }),
        })
        if (descRes.ok) {
          const { description: desc } = await descRes.json()
          setDescription(desc)
        }
      }

      setStep("ready")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video generation failed")
      setStep("error")
    }
  }

  async function handlePublishToYoutube() {
    if (!videoUrl || !script) return
    setStep("uploading")
    setProgress("Uploading to YouTube…")
    setError(null)

    try {
      // Server-side upload — avoids CORS and handles token refresh automatically
      const res = await fetch("/api/admin/upload-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          title: script.youtubeTitle,
          description: description || script.youtubeDescription,
          tags: script.youtubeTags,
          playlistId,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const { youtubeUrl: ytUrl } = await res.json()
      setYoutubeUrl(ytUrl)
      setStep("done")
    } catch (e) {
      setError(e instanceof Error ? e.message : "YouTube upload failed")
      setStep("error")
    }
  }

  const stepLabels: Record<string, string> = {
    "generating-script": "Generating Script",
    "script-ready": "Script Ready",
    "generating-audio": "Generating Audio",
    "composing": "Composing",
    "rendering": "Rendering",
    "ready": "Ready to Publish",
    "uploading": "Uploading",
    "done": "Published!",
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
        onClick={() => { setOpen(true); setStep("idle") }}
      >
        <Youtube className="h-4 w-4" />
        Publish to YouTube
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                  <Youtube className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Publish to YouTube</h2>
                  {step !== "idle" && step !== "error" && (
                    <p className="text-xs text-muted-foreground">{stepLabels[step] || step}</p>
                  )}
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-1 px-6 pt-4">
              {[
                { key: "script", icon: <Sparkles className="h-3 w-3" />, label: "Script" },
                { key: "audio", icon: <Mic className="h-3 w-3" />, label: "Audio" },
                { key: "video", icon: <Film className="h-3 w-3" />, label: "Video" },
                { key: "publish", icon: <Upload className="h-3 w-3" />, label: "Publish" },
              ].map((s, i) => {
                const active =
                  (s.key === "script" && ["generating-script", "script-ready"].includes(step)) ||
                  (s.key === "audio" && step === "generating-audio") ||
                  (s.key === "video" && ["composing", "rendering", "ready"].includes(step)) ||
                  (s.key === "publish" && ["uploading", "done"].includes(step))
                const done =
                  (s.key === "script" && !["idle", "generating-script", "error"].includes(step)) ||
                  (s.key === "audio" && ["composing", "rendering", "ready", "uploading", "done"].includes(step)) ||
                  (s.key === "video" && ["ready", "uploading", "done"].includes(step)) ||
                  (s.key === "publish" && step === "done")

                return (
                  <div key={s.key} className="flex items-center gap-1 flex-1">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                        done ? "bg-green-500/15 text-green-400" :
                        active ? "bg-blue-500/15 text-blue-400" :
                        "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {done ? <CheckCircle className="h-3 w-3" /> : s.icon}
                      {s.label}
                    </div>
                    {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
                  </div>
                )
              })}
            </div>

            {/* Content */}
            <div className="px-6 py-5 min-h-[260px]">

              {/* IDLE */}
              {step === "idle" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will convert <strong className="text-foreground">&ldquo;{slug}&rdquo;</strong> into a YouTube video using:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-blue-400" /> GPT-4o generates viral script + slide content</li>
                    <li className="flex items-center gap-2"><Mic className="h-3.5 w-3.5 text-blue-400" /> OpenAI TTS (onyx voice) narrates the script</li>
                    <li className="flex items-center gap-2"><Film className="h-3.5 w-3.5 text-blue-400" /> Shotstack assembles slides + audio into HD video</li>
                    <li className="flex items-center gap-2"><Youtube className="h-3.5 w-3.5 text-red-400" /> Published to your YouTube channel as public video</li>
                  </ul>
                  <Button className="w-full gap-2 mt-2" onClick={handleGenerateScript}>
                    <Sparkles className="h-4 w-4" />
                    Generate Script
                  </Button>
                </div>
              )}

              {/* GENERATING SCRIPT */}
              {step === "generating-script" && (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm text-muted-foreground">GPT-4o is writing the script…</p>
                </div>
              )}

              {/* SCRIPT READY */}
              {step === "script-ready" && script && (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">YouTube Title</p>
                    <p className="font-semibold text-sm">{script.youtubeTitle}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                      {script.slides.length} Slides · ~{Math.round(script.estimatedDuration / 60)} min
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {script.slides.map((s, i) => (
                        <span key={i} className="rounded-md border bg-card px-2 py-0.5 text-xs text-muted-foreground">
                          {i + 1}. {s.title.slice(0, 30)}{s.title.length > 30 ? "…" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {script.youtubeTags.slice(0, 6).map((tag) => (
                      <span key={tag} className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Button className="w-full gap-2" onClick={handleGenerateVideo}>
                    <Film className="h-4 w-4" />
                    Generate Video
                  </Button>
                </div>
              )}

              {/* GENERATING / COMPOSING / RENDERING */}
              {["generating-audio", "composing", "rendering"].includes(step) && (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm text-muted-foreground text-center max-w-sm">{progress}</p>
                </div>
              )}

              {/* READY TO PUBLISH */}
              {step === "ready" && videoUrl && (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-green-500/10 border-green-500/30 p-3 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-400">Video rendered successfully</p>
                      <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline">
                        Preview video ↗
                      </a>
                    </div>
                  </div>
                  {script && (
                    <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                      <strong className="text-foreground block mb-1">{script.youtubeTitle}</strong>
                      {playlistId && <span className="text-green-400">✓ Playlist ready</span>}
                    </div>
                  )}
                  {description && (
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">YouTube Description</span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(description); setDescCopied(true); setTimeout(() => setDescCopied(false), 2000) }}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {descCopied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-28 overflow-auto font-mono">{description.slice(0, 300)}…</pre>
                    </div>
                  )}
                  <Button className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white" onClick={handlePublishToYoutube}>
                    <Youtube className="h-4 w-4" />
                    Publish to YouTube
                  </Button>
                </div>
              )}

              {/* UPLOADING */}
              {step === "uploading" && (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                  <p className="text-sm text-muted-foreground">{progress}</p>
                </div>
              )}

              {/* DONE */}
              {step === "done" && youtubeUrl && (
                <div className="flex flex-col items-center justify-center h-40 gap-4">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                  <div className="text-center">
                    <p className="font-semibold">Published to YouTube!</p>
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline mt-1 block"
                    >
                      {youtubeUrl}
                    </a>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Close</Button>
                </div>
              )}

              {/* ERROR */}
              {step === "error" && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setStep("idle")}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
