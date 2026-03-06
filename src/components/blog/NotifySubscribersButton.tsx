"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Bell, Loader2, CheckCircle, X, Users, Sparkles } from "lucide-react"
import { ADMIN_EMAIL } from "@/lib/auth"

type State = "idle" | "sending" | "done" | "error" | "already-sent"

interface Result {
  sent: number
  failed: number
  total: number
  synopsis: string
}

export function NotifySubscribersButton({ slug }: { slug: string }) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>("idle")
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!session || session.user?.email !== ADMIN_EMAIL) return null

  async function handleSend() {
    setState("sending")
    setError(null)
    try {
      const res = await fetch("/api/admin/notify-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setState("already-sent")
        return
      }
      if (!res.ok) throw new Error(data.error || "Send failed")
      setResult(data)
      setState("done")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send newsletter")
      setState("error")
    }
  }

  function reset() {
    setState("idle")
    setResult(null)
    setError(null)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-400"
        onClick={() => { setOpen(true); reset() }}
      >
        <Bell className="h-4 w-4" />
        Notify Subscribers
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-card shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                  <Bell className="h-4 w-4 text-blue-400" />
                </div>
                <h2 className="font-semibold text-sm">Notify Subscribers</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 min-h-[200px]">

              {/* IDLE */}
              {state === "idle" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will send a newsletter email to all subscribers announcing{" "}
                    <strong className="text-foreground">&ldquo;{slug}&rdquo;</strong>.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                      GPT-4o-mini generates a unique synopsis angle
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                      Sent to all active subscribers via Resend
                    </li>
                    <li className="flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                      Each email includes a one-click unsubscribe link
                    </li>
                  </ul>
                  <Button className="w-full gap-2 mt-2" onClick={handleSend}>
                    <Bell className="h-4 w-4" />
                    Send Newsletter
                  </Button>
                </div>
              )}

              {/* SENDING */}
              {state === "sending" && (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Sending newsletter&hellip;</p>
                    <p className="text-xs text-muted-foreground mt-1">Generating synopsis and delivering to subscribers</p>
                  </div>
                </div>
              )}

              {/* DONE */}
              {state === "done" && result && (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-green-500/10 border-green-500/30 p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-400">Newsletter delivered</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {result.sent} sent · {result.failed} failed · {result.total} total
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Synopsis</p>
                    <p className="text-xs text-foreground leading-relaxed">{result.synopsis}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </div>
              )}

              {/* ALREADY SENT */}
              {state === "already-sent" && (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-yellow-500/10 border-yellow-500/30 p-4 flex items-start gap-3">
                    <Bell className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-400">Already sent</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Newsletter for this post has already been delivered to subscribers.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </div>
              )}

              {/* ERROR */}
              {state === "error" && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                  <Button variant="outline" className="w-full" onClick={reset}>
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
