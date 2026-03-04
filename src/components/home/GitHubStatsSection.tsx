import { Suspense } from "react"
import { getGitHubStats, getContributions } from "@/lib/github"
import { AnimatedSection } from "@/components/shared/AnimatedSection"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { StatsCardGrid } from "@/components/github/StatsCardGrid"
import { LanguageChart } from "@/components/github/LanguageChart"
import { ContributionGraph } from "@/components/github/ContributionGraph"
import { RepoStats } from "@/components/github/RepoStats"
import { StreakCounter } from "@/components/github/StreakCounter"
import { SITE_CONFIG } from "@/lib/constants"
import Link from "next/link"
import { Github } from "lucide-react"

function StatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-lg bg-muted" />
        <div className="h-48 rounded-lg bg-muted" />
      </div>
      <div className="h-40 rounded-lg bg-muted" />
    </div>
  )
}

async function GitHubStatsContent() {
  const [stats, contributions] = await Promise.all([
    getGitHubStats(),
    getContributions(),
  ])

  return (
    <div className="space-y-6">
      <StatsCardGrid stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <LanguageChart languages={stats.topLanguages} />
        <StreakCounter
          currentStreak={stats.currentStreak}
          longestStreak={stats.longestStreak}
        />
      </div>

      {contributions.weeks.length > 0 && (
        <ContributionGraph data={contributions} />
      )}

      <RepoStats repos={stats.topRepos} />
    </div>
  )
}

export function GitHubStatsSection() {
  return (
    <section id="github" className="section-padding bg-muted/30">
      <div className="container-custom">
        <AnimatedSection>
          <SectionHeader
            label="Open Source"
            title="GitHub Activity"
            description={
              <>
                Real-time stats from{" "}
                <Link
                  href={SITE_CONFIG.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline inline-flex items-center gap-1"
                >
                  <Github className="h-3.5 w-3.5" />
                  @{SITE_CONFIG.githubUsername}
                </Link>
              </>
            }
          />
        </AnimatedSection>

        <Suspense fallback={<StatsSkeleton />}>
          <GitHubStatsContent />
        </Suspense>
      </div>
    </section>
  )
}
