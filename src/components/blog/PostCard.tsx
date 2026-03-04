import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Post } from "@/types/blog"
import { formatDate } from "@/lib/utils"
import { Clock, CalendarDays } from "lucide-react"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { slug, frontmatter } = post

  return (
    <article className="group rounded-lg border bg-card p-6 transition-all hover:border-blue-500/50 hover:shadow-sm">
      <Link href={`/blog/${slug}`} className="block">
        <div className="flex flex-wrap gap-2 mb-3">
          {frontmatter.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="electric" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <h2 className="text-xl font-bold tracking-tight leading-snug mb-3 group-hover:text-blue-500 transition-colors">
          {frontmatter.title}
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
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
  )
}
