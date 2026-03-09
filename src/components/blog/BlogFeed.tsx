"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Clock, CalendarDays, ArrowRight } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { Post } from "@/types/blog"

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function FeaturedCard({ post }: { post: Post }) {
  const { slug, frontmatter } = post
  return (
    <article id={slug} className="group rounded-xl border-2 border-blue-500/25 bg-gradient-to-br from-blue-500/5 via-card to-card p-7 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5">
      <Link href={`/blog/${slug}`} className="block">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
            Latest
          </span>
          {frontmatter.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="electric" className="text-xs">{tag}</Badge>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-3 group-hover:text-blue-400 transition-colors">
          {frontmatter.title}
        </h2>

        <p className="text-muted-foreground leading-relaxed mb-6">
          {frontmatter.description}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDate(frontmatter.date)}
            </span>
            {frontmatter.readingTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {frontmatter.readingTime} min read
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-blue-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            Read article <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  )
}

function FeedCard({ post }: { post: Post }) {
  const { ref, visible } = useReveal()
  const { slug, frontmatter } = post
  return (
    <div
      id={slug}
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      )}
    >
      <article className="group rounded-lg border bg-card p-5 transition-all hover:border-blue-500/30 hover:shadow-sm">
        <Link href={`/blog/${slug}`} className="block">
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {frontmatter.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="electric" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <h2 className="text-lg font-bold tracking-tight leading-snug mb-2 group-hover:text-blue-400 transition-colors">
            {frontmatter.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
            {frontmatter.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(frontmatter.date)}
            </span>
            {frontmatter.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {frontmatter.readingTime} min read
              </span>
            )}
          </div>
        </Link>
      </article>
    </div>
  )
}

export function BlogFeed({ posts }: { posts: Post[] }) {
  const [featured, ...rest] = posts
  if (!featured) return null
  return (
    <div className="space-y-4">
      <FeaturedCard post={featured} />
      {rest.map((post) => (
        <FeedCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
