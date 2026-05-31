"use client"

import { Mail, Users, CheckCircle2 } from "lucide-react"

interface NewsletterSentPanelProps {
  subscriberCount: number
  sentSlugs: string[]
  totalPosts: number
}

export function NewsletterSentPanel({ subscriberCount, sentSlugs, totalPosts }: NewsletterSentPanelProps) {
  const sentCount = sentSlugs.length
  const pendingCount = totalPosts - sentCount

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Mail className="h-4 w-4 text-blue-500" />
        <h2 className="font-semibold text-sm">Newsletter</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{subscriberCount}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Subscribers</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500">{sentCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Posts Notified</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending</p>
        </div>
      </div>

      {sentSlugs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Recently Notified
          </p>
          {sentSlugs.slice(-5).reverse().map((slug) => (
            <div key={slug} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              <span className="text-muted-foreground truncate font-mono">{slug}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
