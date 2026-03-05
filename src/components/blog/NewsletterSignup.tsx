"use client"

import { useState } from "react"
import { Mail, CheckCircle, Loader2 } from "lucide-react"

interface NewsletterSignupProps {
  variant?: "banner" | "inline"
}

export function NewsletterSignup({ variant = "inline" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setState("loading")
    setError("")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setState("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setState("error")
    }
  }

  if (state === "done") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-primary">
        <CheckCircle className="h-3.5 w-3.5" />
        Subscribed!
      </span>
    )
  }

  if (variant === "banner") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium shrink-0">
          <Mail className="h-4 w-4 text-primary" />
          New posts in your inbox
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-8 flex-1 sm:w-52 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
          >
            {state === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Subscribe"}
          </button>
        </div>
        {state === "error" && <p className="text-xs text-destructive w-full">{error}</p>}
      </form>
    )
  }

  // inline — compact, for PostHeader meta row
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="h-7 w-36 rounded border bg-background px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        required
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="flex items-center gap-1 h-7 rounded border border-primary/30 bg-primary/10 px-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
      >
        {state === "loading" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <><Mail className="h-3 w-3" /> Subscribe</>
        )}
      </button>
    </form>
  )
}
