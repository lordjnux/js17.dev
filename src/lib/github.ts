import {
  GitHubStats,
  GitHubRepo,
  LanguageStat,
  ContributionData,
} from "@/types/github"
import { LANGUAGE_COLORS, SITE_CONFIG } from "./constants"

const GITHUB_API = "https://api.github.com"
const USERNAME = SITE_CONFIG.githubUsername

const headers: HeadersInit = {
  Accept: "application/vnd.github.v3+json",
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
}

export async function getGitHubStats(): Promise<GitHubStats> {
  const [user, repos, events] = await Promise.all([
    fetch(`${GITHUB_API}/users/${USERNAME}`, { headers, next: { revalidate: 3600 } }).then((r) => r.json()),
    fetch(`${GITHUB_API}/users/${USERNAME}/repos?per_page=100&sort=updated`, {
      headers,
      next: { revalidate: 3600 },
    }).then((r) => r.json()),
    fetch(`${GITHUB_API}/users/${USERNAME}/events?per_page=100`, {
      headers,
      next: { revalidate: 3600 },
    }).then((r) => r.json()),
  ])

  const ownRepos: GitHubRepo[] = Array.isArray(repos)
    ? repos.filter((r: GitHubRepo) => !r.fork && !r.archived)
    : []

  const totalStars = ownRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0)
  const totalForks = ownRepos.reduce((acc, r) => acc + (r.forks_count || 0), 0)

  const pushEvents = Array.isArray(events)
    ? events.filter((e: { type: string; payload?: { commits?: unknown[] } }) => e.type === "PushEvent")
    : []
  const totalCommits = pushEvents.reduce(
    (acc: number, e: { payload?: { commits?: unknown[] } }) => acc + (e.payload?.commits?.length || 0),
    0
  )

  const languageMap: Record<string, number> = {}
  await Promise.all(
    ownRepos.slice(0, 20).map(async (repo) => {
      try {
        const langs = await fetch(`${GITHUB_API}/repos/${USERNAME}/${repo.name}/languages`, {
          headers,
          next: { revalidate: 3600 },
        }).then((r) => r.json())
        if (langs && typeof langs === "object") {
          Object.entries(langs).forEach(([lang, bytes]) => {
            languageMap[lang] = (languageMap[lang] || 0) + (bytes as number)
          })
        }
      } catch {
        // skip
      }
    })
  )

  const totalBytes = Object.values(languageMap).reduce((a, b) => a + b, 0)
  const topLanguages: LanguageStat[] = Object.entries(languageMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 100),
      color: LANGUAGE_COLORS[name] || LANGUAGE_COLORS.Other,
    }))

  const topRepos = ownRepos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3)

  // Simple streak calculation from events
  const commitDates = pushEvents
    .map((e: { created_at?: string }) => e.created_at?.split("T")[0])
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse() as string[]

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  if (commitDates[0] === today || commitDates[0] === yesterday) {
    for (let i = 0; i < commitDates.length; i++) {
      const curr = new Date(commitDates[i])
      const next = commitDates[i + 1] ? new Date(commitDates[i + 1]) : null
      tempStreak++
      if (!next || (curr.getTime() - next.getTime()) / 86400000 > 1) {
        if (i === 0 || tempStreak > 0) currentStreak = tempStreak
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 0
      }
    }
  }

  return {
    user,
    totalStars,
    totalForks,
    totalCommits,
    topLanguages,
    topRepos,
    currentStreak,
    longestStreak,
  }
}

export async function getContributions(): Promise<ContributionData> {
  if (!process.env.GITHUB_TOKEN) {
    return { totalContributions: 0, weeks: [] }
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { username: USERNAME } }),
    next: { revalidate: 3600 },
  })

  const data = await res.json()
  const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar

  if (!calendar) return { totalContributions: 0, weeks: [] }

  const levelMap: Record<string, 0 | 1 | 2 | 3 | 4> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  }

  return {
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks.map((week: { contributionDays: Array<{ date: string; contributionCount: number; contributionLevel: string }> }) => ({
      days: week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: levelMap[day.contributionLevel] ?? 0,
      })),
    })),
  }
}
