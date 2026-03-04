import Link from "next/link"
import { Star, GitFork, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitHubRepo } from "@/types/github"
import { LANGUAGE_COLORS } from "@/lib/constants"

interface RepoStatsProps {
  repos: GitHubRepo[]
}

export function RepoStats({ repos }: RepoStatsProps) {
  if (!repos.length) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo) => (
        <Card key={repo.id} className="hover:border-blue-500/50 transition-colors group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-semibold leading-tight line-clamp-1">
                {repo.name}
              </CardTitle>
              <Link
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                aria-label={`View ${repo.name} on GitHub`}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
              {repo.description || "No description"}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <GitFork className="h-3 w-3" />
                  {repo.forks_count}
                </span>
              </div>
              {repo.language && (
                <Badge variant="secondary" className="text-xs gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.Other,
                    }}
                  />
                  {repo.language}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
