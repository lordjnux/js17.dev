"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants"

interface StepProps {
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
  error: string | null
}

export function Step5Schedule({ onBack, onSubmit, isSubmitting, error }: StepProps) {
  const calUsername = SITE_CONFIG.calcom.username
  const calEventType = SITE_CONFIG.calcom.eventType

  useEffect(() => {
    // Load Cal.com embed script
    const script = document.createElement("script")
    script.src = "https://app.cal.com/embed/embed.js"
    script.async = true
    script.onload = () => {
      // @ts-expect-error Cal embed global
      if (window.Cal) {
        // @ts-expect-error Cal embed global
        window.Cal("init", { origin: "https://app.cal.com" })
        // @ts-expect-error Cal embed global
        window.Cal("inline", {
          elementOrSelector: "#cal-embed",
          calLink: `${calUsername}/${calEventType}`,
          config: { layout: "month_view" },
        })
        // @ts-expect-error Cal embed global
        window.Cal("ui", {
          theme: "dark",
          styles: { branding: { brandColor: "#3b82f6" } },
          hideEventTypeDetails: false,
          layout: "month_view",
        })
      }
    }
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [calUsername, calEventType])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Schedule a Discovery Call</h2>
        <p className="text-sm text-muted-foreground">
          Optional but recommended — pick a 30-minute slot, or skip and I&apos;ll reach
          out by email after you submit.
        </p>
      </div>

      {/* Cal.com inline embed */}
      <div
        id="cal-embed"
        className="rounded-lg border bg-card overflow-hidden min-h-[500px]"
        style={{ width: "100%" }}
      />

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
              Sending...
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
