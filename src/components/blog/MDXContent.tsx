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
