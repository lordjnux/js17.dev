"use client"

import { useState } from "react"
import { NotifySubscribersButton } from "@/components/blog/NotifySubscribersButton"
import type { Post } from "@/types/blog"
import { CheckCircle2, Clock, FileText, Bell } from "lucide-react"

interface BlogPostsPanelProps {
  posts: Post[]
  sentSlugs: string[]
}

export function BlogPostsPanel({ posts, sentSlugs }: BlogPostsPanelProps) {
  const [filter, setFilter] = useState<"all" | "notified" | "pending">("all")

  const filtered = posts.filter((p) => {
    if (filter === "notified") return sentSlugs.includes(p.slug)
    if (filter === "pending") return !sentSlugs.includes(p.slug)
    return true
  })

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Blog Posts</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
            {posts.length}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-md border p-0.5 text-xs">
          {(["all", "notified", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-2.5 py-1 capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y">
        {filtered.map((post) => {
          const isNotified = sentSlugs.includes(post.slug)
          return (
            <div key={post.slug} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium truncate">{post.frontmatter.title}</p>
                  {post.frontmatter.published ? (
                    <span className="shrink-0 rounded-full bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 text-[10px] font-medium text-green-500">
                      Published
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-muted border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{new Date(post.frontmatter.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  {post.frontmatter.readingTime && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.frontmatter.readingTime} min
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {isNotified ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-green-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Notified
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Bell className="h-3 w-3" />
                    Pending
                  </span>
                )}
                <NotifySubscribersButton slug={post.slug} />
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="px-6 py-8 text-center text-sm text-muted-foreground">
          No posts match this filter.
        </div>
      )}
    </div>
  )
}
