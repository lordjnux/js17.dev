"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MDXContentProps {
  children: React.ReactNode
}

export function MDXContent({ children }: MDXContentProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-pre:p-0 prose-pre:bg-transparent">
      {children}
    </div>
  )
}

interface CodeBlockProps {
  code: string
  filename?: string
}

export function CodeBlock({ code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-6 rounded-lg border bg-zinc-950 overflow-hidden">
      {filename && (
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <span className="text-xs font-mono text-zinc-400">{filename}</span>
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className={cn(
            "absolute right-3 top-3 z-10 rounded-md p-1.5 transition-all",
            "bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200",
            "opacity-0 group-hover:opacity-100"
          )}
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <pre className="overflow-x-auto p-4 text-sm font-mono leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

interface CalloutProps {
  type?: "info" | "warning" | "tip" | "danger"
  children: React.ReactNode
}

const calloutStyles = {
  info: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  tip: "border-green-500/30 bg-green-500/10 text-green-200",
  danger: "border-red-500/30 bg-red-500/10 text-red-200",
}

const calloutIcons = { info: "ℹ️", warning: "⚠️", tip: "💡", danger: "🚨" }

export function Callout({ type = "info", children }: CalloutProps) {
  return (
    <div className={cn("my-6 rounded-lg border p-4", calloutStyles[type])}>
      <div className="flex gap-3">
        <span>{calloutIcons[type]}</span>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

// ─── Visual enrichment components ───────────────────────────────────────────

/** Hero metric cards row */
export function StatRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
      {children}
    </div>
  )
}

export function StatCard({
  value,
  label,
  icon,
  color = "blue",
}: {
  value: string
  label: string
  icon: string
  color?: "blue" | "green" | "purple" | "orange"
}) {
  const colors = {
    blue:   "border-blue-500/30 bg-blue-500/10 text-blue-400",
    green:  "border-green-500/30 bg-green-500/10 text-green-400",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    orange: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  }
  return (
    <div className={cn("rounded-xl border p-4 text-center", colors[color])}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs mt-1 opacity-80">{label}</div>
    </div>
  )
}

/** Tech stack cards grid */
export function StackGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose grid gap-3 sm:grid-cols-2 my-8">
      {children}
    </div>
  )
}

export function StackItem({
  icon,
  layer,
  tech,
  reason,
}: {
  icon: string
  layer: string
  tech: string
  reason: string
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex gap-3">
      <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{layer}</span>
          <span className="font-semibold text-sm text-foreground">{tech}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{reason}</p>
      </div>
    </div>
  )
}

/** Vertical timeline */
export function Timeline({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose relative my-8 space-y-0 border-l-2 border-blue-500/30 ml-3">
      {children}
    </div>
  )
}

export function TimelineStep({
  time,
  label,
  done = true,
}: {
  time: string
  label: string
  done?: boolean
}) {
  return (
    <div className="relative pl-6 pb-6 last:pb-0">
      <span
        className={cn(
          "absolute -left-[9px] top-0.5 h-4 w-4 rounded-full border-2 border-background",
          done ? "bg-blue-500" : "bg-muted"
        )}
      />
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="font-mono text-sm font-bold text-blue-400">{time}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

/** Iteration bar chart */
export function IterationBars({ children }: { children: React.ReactNode }) {
  return <div className="not-prose my-8 space-y-3">{children}</div>
}

export function IterationBar({
  category,
  count,
  total,
  resolvedBy,
  color = "blue",
}: {
  category: string
  count: number
  total: number
  resolvedBy: string
  color?: "blue" | "green" | "purple" | "orange" | "red"
}) {
  const pct = Math.round((count / total) * 100)
  const barColors = {
    blue:   "bg-blue-500",
    green:  "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-400",
    red:    "bg-red-500",
  }
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
        <span className="font-semibold text-sm text-foreground">{category}</span>
        <span className="text-xs font-mono text-muted-foreground">{count} iteration{count !== 1 ? "s" : ""}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className={cn("h-full rounded-full transition-all", barColors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Resolved by: {resolvedBy}</p>
    </div>
  )
}

/** Skill category cards */
export function SkillSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose grid gap-4 sm:grid-cols-2 my-8">
      {children}
    </div>
  )
}

export function SkillCategory({
  icon,
  title,
  skills,
}: {
  icon: string
  title: string
  skills: string[]
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h4 className="font-semibold text-sm text-foreground">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span
            key={s}
            className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Challenge card */
export function ChallengeCard({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="not-prose rounded-xl border bg-card my-6 overflow-hidden">
      <div className="flex items-center gap-3 border-b bg-muted/30 px-5 py-3">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
          {number}
        </span>
        <h4 className="font-semibold text-sm text-foreground">{title}</h4>
      </div>
      <div className="px-5 py-4 prose prose-slate dark:prose-invert max-w-none prose-p:my-2 prose-pre:p-0 prose-pre:bg-transparent prose-code:font-mono prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded text-sm">
        {children}
      </div>
    </div>
  )
}

/** CTA block */
export function CTABlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-10 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-8 text-center">
      {children}
    </div>
  )
}
