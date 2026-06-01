export interface StravaRunTotals {
  count: number
  distance: number
  moving_time: number
  elapsed_time: number
  elevation_gain: number
}

export interface StravaAthleteStats {
  all_run_totals: StravaRunTotals
  ytd_run_totals: StravaRunTotals
  recent_run_totals: StravaRunTotals
  all_ride_totals: StravaRunTotals
  ytd_ride_totals: StravaRunTotals
  all_swim_totals: StravaRunTotals
  ytd_swim_totals: StravaRunTotals
}

export interface StravaAthlete {
  id: number
  firstname: string
  lastname: string
  city: string
  country: string
  profile: string
}

export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  distance: number
  moving_time: number
  start_date_local: string
  total_elevation_gain: number
  average_speed: number
  average_heartrate?: number
  max_heartrate?: number
  average_cadence?: number
  calories?: number
  suffer_score?: number
}

export interface StravaAIInsights {
  summary: string
  strengths: string[]
  suggestions: string[]
  weeklyTrend: "improving" | "consistent" | "declining"
  generatedAt: string
}

export interface StravaStats {
  athlete: StravaAthlete
  stats: StravaAthleteStats
  recentActivities: StravaActivity[]
  streaks: { current: number; longest: number }
  cachedAt: string
}

export interface StravaTokenCache {
  access_token: string
  refresh_token: string
  expires_at: number
}
