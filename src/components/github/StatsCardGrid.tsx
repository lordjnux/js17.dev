import { Star, Users, GitCommit } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { GitHubStats } from "@/types/github"
import { formatNumber } from "@/lib/utils"

interface StatsCardGridProps {
  stats: GitHubStats
}

export function StatsCardGrid({ stats }: StatsCardGridProps) {
  const cards = [
    {
      label: "Public Repos",
      value: formatNumber(stats.user.public_repos),
      icon: Star,
      color: "text-blue-500",
    },
    {
      label: "Total Stars",
      value: formatNumber(stats.totalStars),
      icon: Star,
      color: "text-yellow-500",
    },
    {
      label: "Followers",
      value: formatNumber(stats.user.followers),
      icon: Users,
      color: "text-green-500",
    },
    {
      label: "Recent Commits",
      value: formatNumber(stats.totalCommits) + "+",
      icon: GitCommit,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="overflow-hidden">
          <CardContent className="p-6">
            <card.icon className={`h-5 w-5 ${card.color} mb-3`} />
            <p className="text-2xl font-bold tabular-nums">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
