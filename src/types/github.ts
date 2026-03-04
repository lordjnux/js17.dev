export interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  updated_at: string
  fork: boolean
  archived: boolean
}

export interface GitHubStats {
  user: GitHubUser
  totalStars: number
  totalForks: number
  totalCommits: number
  topLanguages: LanguageStat[]
  topRepos: GitHubRepo[]
  currentStreak: number
  longestStreak: number
}

export interface LanguageStat {
  name: string
  bytes: number
  percentage: number
  color: string
}

export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface ContributionWeek {
  days: ContributionDay[]
}

export interface ContributionData {
  totalContributions: number
  weeks: ContributionWeek[]
}
