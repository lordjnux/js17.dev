import { list, put } from "@vercel/blob"
import type {
  StravaActivity,
  StravaAthlete,
  StravaAthleteStats,
  StravaStats,
  StravaTokenCache,
} from "@/types/strava"

const TOKEN_CACHE = "strava/token-cache.json"
const STATS_CACHE = "strava/stats-cache.json"

// ─── Token management ────────────────────────────────────────────────────────

async function getValidAccessToken(): Promise<string> {
  // Try blob cache first
  try {
    const { blobs } = await list({ prefix: TOKEN_CACHE })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      if (res.ok) {
        const cached: StravaTokenCache = await res.json()
        // Valid if more than 5 minutes remain
        if (cached.expires_at > Math.floor(Date.now() / 1000) + 300) {
          return cached.access_token
        }
        // Expired — refresh using cached refresh_token
        return await refreshAccessToken(cached.refresh_token)
      }
    }
  } catch {
    // fall through
  }

  // No cache — use env refresh_token
  const envRefresh = process.env.STRAVA_REFRESH_TOKEN
  if (!envRefresh) throw new Error("STRAVA_REFRESH_TOKEN not set")
  return await refreshAccessToken(envRefresh)
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error("STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET not set")

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Strava token refresh failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  const tokenCache: StravaTokenCache = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  }

  // Always persist — Strava may rotate refresh_token (best-effort; don't fail if blob is unavailable)
  try {
    await put(TOKEN_CACHE, JSON.stringify(tokenCache), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  } catch {
    // Blob unavailable (e.g. store suspended) — token still valid for this request
  }

  return data.access_token
}

// ─── Streak calculation ───────────────────────────────────────────────────────

export function computeStreaks(activities: StravaActivity[]): { current: number; longest: number } {
  const runs = activities.filter((a) => a.type === "Run")
  const seen = new Set<string>()
  const uniqueDates = runs
    .map((a) => a.start_date_local.substring(0, 10))
    .filter((d) => {
      if (seen.has(d)) return false
      seen.add(d)
      return true
    })
    .sort((a, b) => b.localeCompare(a)) // desc

  if (uniqueDates.length === 0) return { current: 0, longest: 0 }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().substring(0, 10)
  const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().substring(0, 10)

  // Current streak
  let current = 0
  if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
    let checkDate = new Date(uniqueDates[0])
    for (const dateStr of uniqueDates) {
      if (dateStr === checkDate.toISOString().substring(0, 10)) {
        current++
        checkDate = new Date(checkDate.getTime() - 86400000)
      } else {
        break
      }
    }
  }

  // Longest streak
  let longest = 1
  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1])
    const curr = new Date(uniqueDates[i])
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diffDays === 1) {
      streak++
    } else {
      longest = Math.max(longest, streak)
      streak = 1
    }
  }
  longest = Math.max(longest, streak)

  return { current, longest }
}

// ─── Core fetch ──────────────────────────────────────────────────────────────

async function fetchFromStrava(perPage = 100, isr = false): Promise<StravaStats> {
  const token = await getValidAccessToken()
  const headers = { Authorization: `Bearer ${token}` }
  const fetchOpts = isr ? { next: { revalidate: 21600 } } : { cache: "no-store" as const }

  // Step 1: fetch athlete (need id for stats endpoint)
  const athleteRes = await fetch("https://www.strava.com/api/v3/athlete", {
    headers,
    ...fetchOpts,
  })
  if (!athleteRes.ok) throw new Error(`GET /athlete failed: ${athleteRes.status}`)
  const athlete: StravaAthlete = await athleteRes.json()

  // Step 2: parallel fetch stats + activities (all sport types)
  const [statsRes, activitiesRes] = await Promise.all([
    fetch(`https://www.strava.com/api/v3/athletes/${athlete.id}/stats`, {
      headers,
      ...fetchOpts,
    }),
    fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`,
      { headers, ...fetchOpts }
    ),
  ])

  if (!statsRes.ok) throw new Error(`GET /athletes/${athlete.id}/stats failed: ${statsRes.status}`)

  const stats: StravaAthleteStats = await statsRes.json()

  // Activities require activity:read scope — degrade gracefully if not granted
  let allActivities: StravaActivity[] = []
  if (activitiesRes.ok) {
    allActivities = await activitiesRes.json()
  }
  const recentActivities = allActivities.slice(0, 30)

  return {
    athlete,
    stats,
    recentActivities,
    streaks: computeStreaks(allActivities),
    cachedAt: new Date().toISOString(),
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getStravaStats(): Promise<StravaStats | null> {
  if (!process.env.STRAVA_CLIENT_ID) return null

  // Try Blob cache first
  try {
    const { blobs } = await list({ prefix: STATS_CACHE })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      if (res.ok) {
        const cached: StravaStats = await res.json()
        if (cached?.athlete && cached?.stats) return cached
      }
    }
  } catch {
    // fall through
  }

  // Fallback: fetch directly with ISR
  try {
    return await fetchFromStrava(100, true)
  } catch {
    return null
  }
}

export async function refreshStravaCache(): Promise<StravaStats> {
  const data = await fetchFromStrava(100, false)
  try {
    await put(STATS_CACHE, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  } catch {
    // Blob unavailable — stats were fetched successfully, cache skipped
  }
  return data
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function metersToKm(m: number): string {
  return (m / 1000).toFixed(1) + " km"
}

export function secsToPace(speedMps: number): string {
  if (!speedMps || speedMps <= 0) return "--"
  const totalSecs = Math.round(1000 / speedMps)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${mins}:${secs.toString().padStart(2, "0")} /km`
}

export function secsToDuration(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function formatDate(isoDateLocal: string): string {
  const d = new Date(isoDateLocal)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
