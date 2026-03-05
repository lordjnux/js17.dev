"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Send, Calendar, ExternalLink } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants"

interface StepProps {
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
  error: string | null
}

type EmbedState = "loading" | "ready" | "failed"

const CAL_EMBED_TIMEOUT_MS = 10000

export function Step5Schedule({ onBack, onSubmit, isSubmitting, error }: StepProps) {
  const calUsername = SITE_CONFIG.calcom.username
  const calEventType = SITE_CONFIG.calcom.eventType
  const [embedState, setEmbedState] = useState<EmbedState>("loading")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Timeout fallback — if Cal doesn't render in time, show alternate UI
    timeoutRef.current = setTimeout(() => setEmbedState("failed"), CAL_EMBED_TIMEOUT_MS)

    function initCal() {
      // @ts-expect-error Cal embed global
      const Cal = window.Cal
      if (!Cal) return

      Cal("init", { origin: "https://app.cal.com" })
      Cal("inline", {
        elementOrSelector: "#cal-embed",
        calLink: `${calUsername}/${calEventType}`,
        config: { layout: "month_view" },
      })
      Cal("ui", {
        theme: "dark",
        styles: { branding: { brandColor: "#3b82f6" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      })

      // Cal doesn't expose a ready callback — use MutationObserver to detect render
      const target = document.getElementById("cal-embed")
      if (!target) return
      const observer = new MutationObserver(() => {
        if (target.children.length > 0) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          setEmbedState("ready")
          observer.disconnect()
        }
      })
      observer.observe(target, { childList: true, subtree: true })
    }

    // @ts-expect-error Cal embed global
    if (window.Cal) {
      // Script already loaded from a previous render — init directly
      initCal()
    } else {
      const script = document.createElement("script")
      script.src = "https://app.cal.com/embed/embed.js"
      script.async = true
      script.onload = initCal
      script.onerror = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setEmbedState("failed")
      }
      document.head.appendChild(script)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [calUsername, calEventType])

  const directBookingUrl = `https://cal.com/${calUsername}/${calEventType}`

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Schedule a Discovery Call</h2>
        <p className="text-sm text-muted-foreground">
          Optional but recommended — pick a 30-minute slot, or skip and I&apos;ll reach out
          by email after you submit.
        </p>
      </div>

      {/* Cal.com embed container */}
      <div className="rounded-lg border bg-card overflow-hidden min-h-[480px] relative">

        {/* Loading skeleton */}
        {embedState === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading scheduler…</p>
          </div>
        )}

        {/* Failed / fallback */}
        {embedState === "failed" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-card px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">Scheduler couldn&apos;t load</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                You can book directly on Cal.com, or skip this step — I&apos;ll follow up by email
                after your submission.
              </p>
            </div>
            <a
              href={directBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Calendar className="h-4 w-4" />
              Book on Cal.com
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          </div>
        )}

        {/* Actual Cal embed target — always in DOM so Cal can mount into it */}
        <div
          id="cal-embed"
          style={{ width: "100%", height: "100%", minHeight: 480 }}
          className={embedState === "failed" ? "invisible" : undefined}
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Proposal
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
