"use client"

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
  const calUrl = `https://cal.com/${SITE_CONFIG.calcom.username}/${SITE_CONFIG.calcom.eventType}`

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Schedule a Discovery Call</h2>
        <p className="text-sm text-muted-foreground">
          Optional but recommended — pick a time that works for you, or skip and I&apos;ll reach out by email.
        </p>
      </div>

      {/* Cal.com embed */}
      <div className="rounded-lg border bg-card overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4 text-sm">
            Click below to open the scheduling calendar in a new tab:
          </p>
          <Button variant="outline" asChild>
            <a href={calUrl} target="_blank" rel="noopener noreferrer">
              Open Scheduling Calendar
            </a>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            30-minute discovery call · Google Calendar integration
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack} className="gap-2" disabled={isSubmitting}>
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
