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
  distance: number
  moving_time: number
  start_date_local: string
  total_elevation_gain: number
  average_speed: number
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
