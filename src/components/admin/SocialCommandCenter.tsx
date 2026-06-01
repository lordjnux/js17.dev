"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle, XCircle, Loader2, Link2, Sparkles, Send,
  ExternalLink, ArrowLeft, Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PlatformStatus {
  connected: boolean
  expiresAt?: number | null
  personUrn?: string | null
  pageUrn?: string | null
  method?: string
}

interface SocialStatus {
  platforms: {
    x: PlatformStatus
    linkedinPersonal: PlatformStatus
    linkedinPage: PlatformStatus
  }
  recentPosts: RecentPost[]
}

interface RecentPost {
  id: string
  timestamp: string
  platforms: string[]
  results: { platform: string; success: boolean; url?: string; error?: string }[]
}

interface Drafts {
  x: string
  linkedinPersonal: string
  linkedinPage: string
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  x: { label: "X (Twitter)", color: "#1DA1F2" },
  linkedinPersonal: { label: "LinkedIn Personal", color: "#0A66C2" },
  linkedinPage: { label: "LinkedIn Page", color: "#0077B5" },
}

export function SocialCommandCenter() {
  const [status, setStatus] = useState<SocialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [articleTitle, setArticleTitle] = useState("")
  const [articleDesc, setArticleDesc] = useState("")
  const [articleUrl, setArticleUrl] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<("x" | "linkedin-personal" | "linkedin-page")[]>([])
  const [drafts, setDrafts] = useState<Drafts>({ x: "", linkedinPersonal: "", linkedinPage: "" })
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting] = useState(false)
  const [postResults, setPostResults] = useState<RecentPost["results"] | null>(null)

  useEffect(() => {
    fetch("/api/admin/social/status")
      .then((r) => r.json())
      .then((d) => { setStatus(d); setLoading(false) })
      .catch(() => setLoading(false))

    // Handle OAuth callback params
    const params = new URLSearchParams(window.location.search)
    if (params.get("connected") === "linkedin") {
      window.history.replaceState({}, "", "/admin/social")
      fetch("/api/admin/social/status")
        .then((r) => r.json())
        .then(setStatus)
    }
  }, [])

  const togglePlatform = (p: "x" | "linkedin-personal" | "linkedin-page") => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const handleGenerate = async () => {
    if (!articleTitle || !articleUrl || selectedPlatforms.length === 0) return
    setGenerating(true)
    try {
      const res = await fetch("/api/admin/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: articleTitle,
          description: articleDesc,
          url: articleUrl,
          platforms: selectedPlatforms,
        }),
      })
      const data = await res.json()
      setDrafts({
        x: data.x ?? drafts.x,
        linkedinPersonal: data.linkedinPersonal ?? drafts.linkedinPersonal,
        linkedinPage: data.linkedinPage ?? drafts.linkedinPage,
      })
    } finally {
      setGenerating(false)
    }
  }

  const handlePost = async () => {
    if (selectedPlatforms.length === 0) return
    setPosting(true)
    setPostResults(null)
    try {
      const content: Record<string, string> = {}
      if (selectedPlatforms.includes("x") && drafts.x) content.x = drafts.x
      if (selectedPlatforms.includes("linkedin-personal") && drafts.linkedinPersonal)
        content.linkedinPersonal = drafts.linkedinPersonal
      if (selectedPlatforms.includes("linkedin-page") && drafts.linkedinPage)
        content.linkedinPage = drafts.linkedinPage

      const res = await fetch("/api/admin/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platforms: selectedPlatforms, content }),
      })
      const data = await res.json()
      setPostResults(data.results)

      // Refresh status + history
      const statusRes = await fetch("/api/admin/social/status")
      setStatus(await statusRes.json())
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const platforms = status?.platforms

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Omnipresence Engine</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Compose once, publish everywhere.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
      </div>

      {/* Connection status */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Platform Connections
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <ConnectionCard
            label="X (Twitter)"
            connected={platforms?.x.connected ?? false}
            detail={platforms?.x.connected ? "OAuth 1.0a · Ready" : "Add X_ACCESS_TOKEN env vars"}
          />
          <ConnectionCard
            label="LinkedIn Personal"
            connected={platforms?.linkedinPersonal.connected ?? false}
            detail={
              platforms?.linkedinPersonal.connected
                ? `Expires ${new Date(platforms.linkedinPersonal.expiresAt!).toLocaleDateString()}`
                : "Click to connect"
            }
            connectHref="/api/auth/linkedin/connect"
          />
          <ConnectionCard
            label="LinkedIn Page"
            connected={platforms?.linkedinPage.connected ?? false}
            detail={
              platforms?.linkedinPage.connected
                ? `URN: ${platforms.linkedinPage.pageUrn?.split(":").pop()}`
                : "Set LINKEDIN_PAGE_URN env var"
            }
          />
        </div>
      </section>

      {/* Compose */}
      <section className="rounded-xl border bg-card p-6 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Compose
        </h2>

        {/* Article metadata */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Article Title</label>
            <input
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              placeholder="My new blog post"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Article URL</label>
            <input
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://js17.dev/blog/..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground mb-1.5 block">Description (optional)</label>
            <input
              value={articleDesc}
              onChange={(e) => setArticleDesc(e.target.value)}
              placeholder="Brief description for AI context"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Platform toggles */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Target Platforms</label>
          <div className="flex flex-wrap gap-2">
            {(["x", "linkedin-personal", "linkedin-page"] as const).map((p) => {
              const connected =
                p === "x" ? platforms?.x.connected :
                p === "linkedin-personal" ? platforms?.linkedinPersonal.connected :
                platforms?.linkedinPage.connected
              const active = selectedPlatforms.includes(p)
              return (
                <button
                  key={p}
                  disabled={!connected}
                  onClick={() => togglePlatform(p)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    !connected
                      ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
                      : active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {PLATFORM_LABELS[p].label}
                  {!connected && " (not connected)"}
                </button>
              )
            })}
          </div>
        </div>

        {/* Generate drafts */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating || !articleTitle || !articleUrl || selectedPlatforms.length === 0}
            className="gap-2"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating…" : "Generate AI Drafts"}
          </Button>
          <span className="text-xs text-muted-foreground">
            GPT-4o-mini generates platform-optimized copy
          </span>
        </div>

        {/* Draft editors */}
        {selectedPlatforms.length > 0 && (
          <div className="space-y-4">
            {selectedPlatforms.includes("x") && (
              <DraftEditor
                platform="X (Twitter)"
                value={drafts.x}
                onChange={(v) => setDrafts((d) => ({ ...d, x: v }))}
                maxLength={280}
              />
            )}
            {selectedPlatforms.includes("linkedin-personal") && (
              <DraftEditor
                platform="LinkedIn Personal"
                value={drafts.linkedinPersonal}
                onChange={(v) => setDrafts((d) => ({ ...d, linkedinPersonal: v }))}
                maxLength={3000}
              />
            )}
            {selectedPlatforms.includes("linkedin-page") && (
              <DraftEditor
                platform="LinkedIn Page"
                value={drafts.linkedinPage}
                onChange={(v) => setDrafts((d) => ({ ...d, linkedinPage: v }))}
                maxLength={1300}
              />
            )}
          </div>
        )}

        {/* Post button */}
        {selectedPlatforms.length > 0 && (
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handlePost}
              disabled={posting || selectedPlatforms.every((p) => {
                const key = p === "x" ? "x" : p === "linkedin-personal" ? "linkedinPersonal" : "linkedinPage"
                return !drafts[key as keyof Drafts]
              })}
              className="gap-2"
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {posting ? "Publishing…" : `Publish to ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? "s" : ""}`}
            </Button>
          </div>
        )}

        {/* Post results */}
        {postResults && (
          <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
            {postResults.map((r) => (
              <div key={r.platform} className="flex items-center gap-3 text-sm">
                {r.success
                  ? <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  : <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                <span className="font-medium">{PLATFORM_LABELS[r.platform]?.label ?? r.platform}</span>
                {r.success && r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    View post <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {!r.success && <span className="text-xs text-destructive truncate">{r.error}</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Post history */}
      {status?.recentPosts && status.recentPosts.length > 0 && (
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent Posts
          </h2>
          <div className="space-y-3">
            {status.recentPosts.map((post) => (
              <div key={post.id} className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{new Date(post.timestamp).toLocaleString()}</span>
                  <div className="flex gap-1.5">
                    {post.results.map((r) => (
                      <span key={r.platform} className={r.success ? "text-green-400" : "text-destructive"}>
                        {PLATFORM_LABELS[r.platform]?.label.split(" ")[0] ?? r.platform}
                        {r.success ? " ✓" : " ✗"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ConnectionCard({
  label,
  connected,
  detail,
  connectHref,
}: {
  label: string
  connected: boolean
  detail: string
  connectHref?: string
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        {connected
          ? <CheckCircle className="h-4 w-4 text-green-400" />
          : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
      {!connected && connectHref && (
        <a
          href={connectHref}
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Link2 className="h-3 w-3" />
          Connect
        </a>
      )}
    </div>
  )
}

function DraftEditor({
  platform,
  value,
  onChange,
  maxLength,
}: {
  platform: string
  value: string
  onChange: (v: string) => void
  maxLength: number
}) {
  const remaining = maxLength - value.length
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{platform}</label>
        <span className={`text-[11px] tabular-nums ${remaining < 0 ? "text-destructive" : "text-muted-foreground/50"}`}>
          {remaining}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={platform.includes("Twitter") || platform.includes("X ") ? 3 : 6}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y font-mono"
        placeholder={`Write your ${platform} post here…`}
      />
    </div>
  )
}
