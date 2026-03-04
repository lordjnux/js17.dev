import { Badge } from "@/components/ui/badge"
import { PostFrontmatter } from "@/types/blog"
import { formatDate } from "@/lib/utils"
import { Clock, CalendarDays, User } from "lucide-react"

interface PostHeaderProps {
  frontmatter: PostFrontmatter
}

export function PostHeader({ frontmatter }: PostHeaderProps) {
  return (
    <header className="mb-8 pb-8 border-b">
      <div className="flex flex-wrap gap-2 mb-4">
        {frontmatter.tags.map((tag) => (
          <Badge key={tag} variant="electric">
            {tag}
          </Badge>
        ))}
      </div>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight mb-4">
        {frontmatter.title}
      </h1>

      <p className="text-xl text-muted-foreground leading-relaxed mb-6">
        {frontmatter.description}
      </p>

      <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
        {frontmatter.author && (
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {frontmatter.author}
          </span>
        )}
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
    </header>
  )
}
