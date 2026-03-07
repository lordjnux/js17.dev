"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

/* ─── Scroll Reveal Hook ──────────────────────────────────────── */

function useScrollReveal(threshold = 0.1) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { visible, ref }
}

/* ─── Data Types ──────────────────────────────────────────────── */

type Tier = "free" | "paid" | "oss"

interface ProviderNode {
  id: string
  name: string
  icon: string
  role: string
  detail: string
  connectionType: string
  cost: string
  tier: Tier
  tierLabel: string
}

interface Layer {
  id: string
  label: string
  sublabel: string
  color: string
  accent: string
  glowColor: string
  providers: ProviderNode[]
  flowLabel?: string
}

/* ─── Architecture Data ───────────────────────────────────────── */

const LAYERS: Layer[] = [
  {
    id: "edge",
    label: "EDGE",
    sublabel: "DNS + CDN + SSL",
    color: "text-yellow-400",
    accent: "yellow",
    glowColor: "rgba(234,179,8,0.15)",
    flowLabel: "HTTPS / Reverse Proxy",
    providers: [
      {
        id: "cloudflare",
        name: "Cloudflare",
        icon: "\u{1F6E1}\uFE0F",
        role: "DNS + CDN + SSL + DDoS",
        detail: "Proxied DNS with full DDoS protection, automatic SSL/TLS certificates, and global edge caching. All inbound traffic routes through Cloudflare before reaching Vercel. CNAME record points sandbox.js17.dev to Vercel.",
        connectionType: "DNS Proxy",
        cost: "$0/mo",
        tier: "free",
        tierLabel: "Free Plan",
      },
      {
        id: "godaddy",
        name: "GoDaddy",
        icon: "\uD83C\uDF10",
        role: "Domain registrar",
        detail: "js17.dev domain registration. Nameservers delegated to Cloudflare (ns1/ns2.cloudflare.com) for full DNS management. Only cost is annual domain renewal.",
        connectionType: "DNS Delegation",
        cost: "~$12/yr",
        tier: "paid",
        tierLabel: "Annual Registration",
      },
    ],
  },
  {
    id: "platform",
    label: "PLATFORM",
    sublabel: "Hosting + CI/CD",
    color: "text-cyan-400",
    accent: "cyan",
    glowColor: "rgba(6,182,212,0.15)",
    flowLabel: "Serverless Runtime + Edge Functions",
    providers: [
      {
        id: "vercel",
        name: "Vercel",
        icon: "\u25B2",
        role: "Hosting + Serverless + Edge + Cron",
        detail: "Hobby plan: automatic deployments from Git push, serverless API routes, Edge runtime, ISR revalidation, Vercel Blob storage, cron jobs (daily YouTube metrics refresh at 06:00 UTC). Two live environments: production (js17.dev) and sandbox (sandbox.js17.dev).",
        connectionType: "Git Deploy",
        cost: "$0/mo",
        tier: "free",
        tierLabel: "Hobby Plan",
      },
      {
        id: "github",
        name: "GitHub",
        icon: "\uD83D\uDC19",
        role: "Source control + CI/CD",
        detail: "Git repository with branch protection (main: PR required, CI must pass, linear history). GitHub Actions: type-check, lint, build gates on every PR. Automated releases via standard-version. Conventional commits enforced by commitlint + husky.",
        connectionType: "Git + REST API",
        cost: "$0/mo",
        tier: "free",
        tierLabel: "Free Plan",
      },
    ],
  },
  {
    id: "core",
    label: "APPLICATION",
    sublabel: "js17.dev",
    color: "text-blue-400",
    accent: "blue",
    glowColor: "rgba(59,130,246,0.2)",
    flowLabel: "REST API / SDK / OAuth 2.0",
    providers: [
      {
        id: "nextjs",
        name: "Next.js 14",
        icon: "\u26A1",
        role: "App Router + RSC + SSG + ISR",
        detail: "Full App Router with React Server Components, static generation, incremental static regeneration (ISR), Edge API routes, and middleware. TypeScript strict mode throughout.",
        connectionType: "Framework",
        cost: "$0",
        tier: "oss",
        tierLabel: "Open Source",
      },
      {
        id: "react",
        name: "React 18",
        icon: "\u269B\uFE0F",
        role: "UI runtime + Hooks + RSC",
        detail: "React Server Components for zero-JS server rendering. Client components with hooks for interactivity. React Three Fiber for 3D architecture visualizations. Framer Motion for scroll-triggered animations.",
        connectionType: "Runtime",
        cost: "$0",
        tier: "oss",
        tierLabel: "Open Source",
      },
      {
        id: "tailwind",
        name: "Tailwind CSS",
        icon: "\uD83C\uDFA8",
        role: "4 theme palettes + shadcn/ui",
        detail: "Utility-first CSS with 4 custom palettes (dark, light, titanium, aurora). shadcn-style components built on Radix UI primitives. CSS variables for theme-aware gradients. Typography plugin for prose.",
        connectionType: "Build Tool",
        cost: "$0",
        tier: "oss",
        tierLabel: "Open Source",
      },
      {
        id: "mdx",
        name: "MDX Engine",
        icon: "\uD83D\uDCDD",
        role: "Blog + Changelog content",
        detail: "next-mdx-remote for dynamic MDX compilation. gray-matter for frontmatter parsing. rehype-pretty-code + shiki for syntax highlighting. rehype-slug for heading anchors. Custom component registry for rich interactive content.",
        connectionType: "Build Pipeline",
        cost: "$0",
        tier: "oss",
        tierLabel: "Open Source",
      },
    ],
  },
  {
    id: "ai",
    label: "AI SERVICES",
    sublabel: "Intelligence Layer",
    color: "text-emerald-400",
    accent: "emerald",
    glowColor: "rgba(16,185,129,0.15)",
    providers: [
      {
        id: "openai",
        name: "OpenAI",
        icon: "\uD83E\uDDE0",
        role: "GPT-4o + TTS + Moderation",
        detail: "GPT-4o generates structured video narration scripts (intro/core/outro slides). OpenAI TTS with onyx voice (HD model) produces broadcast-quality audio stored in Vercel Blob. Moderation API powers 3-layer content filtering with autonomous learning blocklist. GPT-4o-mini generates newsletter synopses.",
        connectionType: "REST API (SDK)",
        cost: "~$10/mo",
        tier: "paid",
        tierLabel: "Pay-as-you-go",
      },
      {
        id: "shotstack",
        name: "Shotstack",
        icon: "\uD83C\uDFAC",
        role: "Cloud video rendering",
        detail: "Video composition API. Composites slide images + TTS audio into MP4 videos using 8 visual templates. Dual format output: 1080x1920 (YouTube Short) + 1280x720 (Long). Server-side rendering, ~3 min per video. SSRF-protected proxy route.",
        connectionType: "REST API",
        cost: "~$25/mo",
        tier: "paid",
        tierLabel: "Pay-as-you-go",
      },
    ],
  },
  {
    id: "distribution",
    label: "DISTRIBUTION",
    sublabel: "Publishing + Notifications",
    color: "text-purple-400",
    accent: "purple",
    glowColor: "rgba(168,85,247,0.15)",
    providers: [
      {
        id: "youtube",
        name: "YouTube",
        icon: "\uD83D\uDCFA",
        role: "Automated video publishing",
        detail: "YouTube Data API v3 for server-side video upload, metadata, categorization, and playlist management. OAuth 2.0 with automatic token refresh (1hr expiry). Per-article tracking stored in Vercel Blob (slug+format). Admin-only publish button.",
        connectionType: "OAuth 2.0 + REST API",
        cost: "$0/mo",
        tier: "free",
        tierLabel: "Data API v3 (Free Quota)",
      },
      {
        id: "resend",
        name: "Resend",
        icon: "\uD83D\uDCE7",
        role: "Email + Newsletter",
        detail: "Transactional emails for proposals and admin notifications. Full newsletter system: subscribe/unsubscribe with HMAC-SHA256 tokens (RFC 8058), MX DNS validation, IP rate limiting (2/hr), disposable domain blocklist, welcome/goodbye emails, batch send with GPT-4o-mini synopsis.",
        connectionType: "REST API (SDK)",
        cost: "$0/mo",
        tier: "free",
        tierLabel: "Free (100 emails/day)",
      },
      {
        id: "credly",
        name: "Credly",
        icon: "\uD83C\uDFC5",
        role: "Verified certifications",
        detail: "Public REST API for fetching verified professional certification badges (AWS, etc). Server-side fetch with 24-hour ISR caching. No authentication required - public endpoint.",
        connectionType: "REST API (Public)",
        cost: "$0/mo",
        tier: "free",
        tierLabel: "Public API",
      },
    ],
  },
  {
    id: "auth-storage",
    label: "AUTH & STORAGE",
    sublabel: "Security + Persistence",
    color: "text-slate-400",
    accent: "slate",
    glowColor: "rgba(100,116,139,0.15)",
    providers: [
      {
        id: "google-oauth",
        name: "Google OAuth",
        icon: "\uD83D\uDD10",
        role: "Admin authentication",
        detail: "NextAuth.js v4 with Google OAuth provider. JWT-based sessions with automatic refresh token rotation (1hr access token expiry). Admin access gated by ADMIN_EMAIL environment variable. OAuth scopes include YouTube upload permission. Uses getToken (not getServerSession) in API routes.",
        connectionType: "OAuth 2.0",
        cost: "$0/mo",
        tier: "free",
        tierLabel: "Free (Google Cloud Console)",
      },
      {
        id: "vercel-blob",
        name: "Vercel Blob",
        icon: "\uD83D\uDCBE",
        role: "Object storage",
        detail: "Stores TTS audio files, moderation records (max 500), newsletter subscribers, custom blocklist, YouTube article-video tracking, metrics cache, sent-posts log. All put() calls use allowOverwrite:true for fixed pathnames. Included in Vercel Hobby plan.",
        connectionType: "SDK (@vercel/blob)",
        cost: "$0/mo",
        tier: "free",
        tierLabel: "Included (Hobby Plan)",
      },
    ],
  },
]

const TIER_STYLES: Record<Tier, { bg: string; text: string; label: string }> = {
  free: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", label: "FREE" },
  paid: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400", label: "PAID" },
  oss: { bg: "bg-blue-500/15 border-blue-500/30", text: "text-blue-400", label: "OSS" },
}

const ACCENT_COLORS: Record<string, { border: string; bg: string; ring: string }> = {
  yellow: { border: "border-yellow-500/30", bg: "bg-yellow-500/[0.04]", ring: "ring-yellow-500/20" },
  cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/[0.04]", ring: "ring-cyan-500/20" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/[0.04]", ring: "ring-blue-500/20" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.04]", ring: "ring-emerald-500/20" },
  purple: { border: "border-purple-500/30", bg: "bg-purple-500/[0.04]", ring: "ring-purple-500/20" },
  slate: { border: "border-slate-500/30", bg: "bg-slate-500/[0.04]", ring: "ring-slate-500/20" },
}

/* ─── Flow Arrow ──────────────────────────────────────────────── */

function FlowArrow({ label, visible, delay }: { label: string; visible: boolean; delay: number }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 py-2 transition-all duration-700",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated line */}
        <div className="w-px h-6 overflow-hidden">
          <div
            className={cn(
              "w-full h-full transition-transform duration-1000",
              visible ? "translate-y-0" : "-translate-y-full",
            )}
            style={{
              background: "linear-gradient(to bottom, rgba(99,102,241,0.6), rgba(168,85,247,0.6))",
              transitionDelay: `${delay + 200}ms`,
            }}
          />
        </div>
        {/* Arrow head */}
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "5px solid rgba(168,85,247,0.6)",
          }}
        />
      </div>
      <span className="text-[9px] font-mono text-white/30 tracking-wider uppercase">{label}</span>
    </div>
  )
}

/* ─── Provider Card ───────────────────────────────────────────── */

function ProviderCardComponent({
  provider,
  accent,
  visible,
  delay,
  expanded,
  onToggle,
}: {
  provider: ProviderNode
  accent: string
  visible: boolean
  delay: number
  expanded: boolean
  onToggle: () => void
}) {
  const tierStyle = TIER_STYLES[provider.tier]
  const accentStyle = ACCENT_COLORS[accent]

  return (
    <button
      onClick={onToggle}
      className={cn(
        "rounded-xl border text-left p-3 transition-all duration-500 w-full",
        "hover:ring-1",
        accentStyle.border,
        accentStyle.bg,
        accentStyle.ring,
        expanded && "ring-1",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-lg flex-shrink-0 mt-0.5">{provider.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-white">{provider.name}</span>
            <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded-full border", tierStyle.bg, tierStyle.text)}>
              {tierStyle.label}
            </span>
          </div>
          <p className="text-[11px] text-white/50 mt-0.5">{provider.role}</p>

          {/* Connection type & cost */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">
              {provider.connectionType}
            </span>
            <span className={cn(
              "text-[10px] font-mono font-bold",
              provider.tier === "paid" ? "text-amber-400" : "text-emerald-400",
            )}>
              {provider.cost}
            </span>
          </div>

          {/* Expandable detail */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              expanded ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0",
            )}
          >
            <p className="text-[11px] text-white/40 leading-relaxed border-t border-white/5 pt-2">
              {provider.detail}
            </p>
          </div>
        </div>

        {/* Expand indicator */}
        <span className={cn(
          "text-[10px] text-white/20 flex-shrink-0 transition-transform duration-200",
          expanded && "rotate-90",
        )}>
          \u25B6
        </span>
      </div>
    </button>
  )
}

/* ─── Cost Summary ────────────────────────────────────────────── */

function CostSummary({ visible }: { visible: boolean }) {
  const costs = [
    { label: "Free tier services", count: 10, cost: "$0" },
    { label: "OpenAI (AI generation)", count: 1, cost: "~$10" },
    { label: "Shotstack (video)", count: 1, cost: "~$25" },
    { label: "GoDaddy (domain)", count: 1, cost: "~$1" },
  ]

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ transitionDelay: "1800ms" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Monthly Cost Breakdown</h4>
        <div className="text-right">
          <div className="text-xl font-bold text-emerald-400 font-mono">~$36</div>
          <div className="text-[9px] text-white/30">total/month</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {costs.map((c) => (
          <div key={c.label} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                c.cost === "$0" ? "bg-emerald-500" : "bg-amber-500",
              )} />
              <span className="text-white/50">{c.label}</span>
              <span className="text-white/20 font-mono">x{c.count}</span>
            </div>
            <span className={cn(
              "font-mono font-bold",
              c.cost === "$0" ? "text-emerald-400" : "text-amber-400",
            )}>
              {c.cost}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
        <span className="text-white/30">vs. traditional equivalent</span>
        <span className="font-mono text-red-400/60 line-through">$25,000+/mo</span>
      </div>
    </div>
  )
}

/* ─── Connection Types Legend ─────────────────────────────────── */

function ConnectionLegend({ visible }: { visible: boolean }) {
  const types = [
    { type: "REST API", desc: "HTTP/JSON endpoints", color: "bg-blue-500" },
    { type: "SDK", desc: "Native client library", color: "bg-cyan-500" },
    { type: "OAuth 2.0", desc: "Token-based auth flow", color: "bg-purple-500" },
    { type: "DNS", desc: "Domain name resolution", color: "bg-yellow-500" },
    { type: "Git", desc: "Push-triggered deploys", color: "bg-emerald-500" },
    { type: "Cron", desc: "Scheduled execution", color: "bg-orange-500" },
  ]

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ transitionDelay: "2000ms" }}
    >
      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Connection Types</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {types.map((t) => (
          <div key={t.type} className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full flex-shrink-0", t.color)} />
            <div>
              <span className="text-[10px] font-bold text-white/70">{t.type}</span>
              <span className="text-[9px] text-white/30 block">{t.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main Blueprint Component ────────────────────────────────── */

export function InfrastructureBlueprint() {
  const { visible, ref } = useScrollReveal(0.05)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleProvider = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  return (
    <div ref={ref} className="not-prose my-10">
      <div
        className={cn(
          "p-px rounded-2xl transition-all duration-1000",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        )}
        style={{
          background: "linear-gradient(135deg, rgba(234,179,8,0.4), rgba(6,182,212,0.4), rgba(59,130,246,0.4), rgba(168,85,247,0.4))",
        }}
      >
        <div className="rounded-2xl bg-[#0a0a1a] overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-white/40 font-mono ml-2">infrastructure-blueprint.arch</span>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[10px] text-white/20 font-mono">13 providers</span>
              <span className="text-[10px] text-emerald-400/70 font-mono">~$36/mo</span>
            </div>
          </div>

          {/* Blueprint body */}
          <div className="p-4 sm:p-6 space-y-0">
            {/* Header */}
            <div
              className={cn(
                "text-center mb-6 transition-all duration-700",
                visible ? "opacity-100" : "opacity-0",
              )}
            >
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">System Architecture</h3>
              <p className="text-[11px] text-white/30 mt-1">
                Click any provider to expand details &middot; Every connection documented
              </p>
            </div>

            {/* Architecture layers */}
            {LAYERS.map((layer, layerIdx) => {
              const baseDelay = layerIdx * 250

              return (
                <div key={layer.id}>
                  {/* Flow arrow between layers */}
                  {layerIdx > 0 && layer.flowLabel === undefined && (
                    <FlowArrow label="" visible={visible} delay={baseDelay - 100} />
                  )}
                  {layerIdx > 0 && LAYERS[layerIdx - 1].flowLabel && (
                    <FlowArrow label={LAYERS[layerIdx - 1].flowLabel!} visible={visible} delay={baseDelay - 100} />
                  )}

                  {/* Layer container */}
                  <div
                    className={cn(
                      "rounded-xl border p-3 sm:p-4 transition-all duration-700",
                      ACCENT_COLORS[layer.accent].border,
                      visible ? "opacity-100" : "opacity-0",
                    )}
                    style={{
                      background: layer.glowColor,
                      transitionDelay: `${baseDelay}ms`,
                    }}
                  >
                    {/* Layer header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn(
                        "h-px flex-1 max-w-8",
                        layer.accent === "yellow" ? "bg-yellow-500/30" :
                        layer.accent === "cyan" ? "bg-cyan-500/30" :
                        layer.accent === "blue" ? "bg-blue-500/30" :
                        layer.accent === "emerald" ? "bg-emerald-500/30" :
                        layer.accent === "purple" ? "bg-purple-500/30" :
                        "bg-slate-500/30",
                      )} />
                      <span className={cn("text-[10px] font-bold tracking-[0.2em] uppercase", layer.color)}>
                        {layer.label}
                      </span>
                      <span className="text-[9px] text-white/20">{layer.sublabel}</span>
                      <div className={cn(
                        "h-px flex-1",
                        layer.accent === "yellow" ? "bg-yellow-500/20" :
                        layer.accent === "cyan" ? "bg-cyan-500/20" :
                        layer.accent === "blue" ? "bg-blue-500/20" :
                        layer.accent === "emerald" ? "bg-emerald-500/20" :
                        layer.accent === "purple" ? "bg-purple-500/20" :
                        "bg-slate-500/20",
                      )} />
                    </div>

                    {/* Provider cards grid */}
                    <div className={cn(
                      "grid gap-2",
                      layer.providers.length === 1 ? "grid-cols-1" :
                      layer.providers.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
                      layer.providers.length === 3 ? "grid-cols-1 sm:grid-cols-3" :
                      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
                    )}>
                      {layer.providers.map((provider, pIdx) => (
                        <ProviderCardComponent
                          key={provider.id}
                          provider={provider}
                          accent={layer.accent}
                          visible={visible}
                          delay={baseDelay + 100 + pIdx * 80}
                          expanded={expandedId === provider.id}
                          onToggle={() => toggleProvider(provider.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Bottom section: Cost + Legend */}
            <div className="grid sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/5">
              <CostSummary visible={visible} />
              <ConnectionLegend visible={visible} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Provider Detail Grid (for MDX body) ─────────────────────── */

export function ProviderGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3 my-8">
      {children}
    </div>
  )
}

export function ProviderDetail({
  name,
  icon,
  connection,
  cost,
  tier,
  children,
}: {
  name: string
  icon: string
  connection: string
  cost: string
  tier: string
  children: React.ReactNode
}) {
  const tierColor = tier === "Free" || tier === "OSS"
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : "text-amber-400 bg-amber-500/10 border-amber-500/20"

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="font-bold text-sm text-foreground">{name}</span>
        <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded-full border ml-auto", tierColor)}>
          {tier}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
          {connection}
        </span>
        <span className={cn(
          "text-[10px] font-mono font-bold",
          tier === "Free" || tier === "OSS" ? "text-emerald-500" : "text-amber-500",
        )}>
          {cost}
        </span>
      </div>
      <div className="text-xs text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  )
}
