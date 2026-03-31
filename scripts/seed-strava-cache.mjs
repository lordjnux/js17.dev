/**
 * Seeds the Strava blob cache directly from local machine.
 * Run with: node scripts/seed-strava-cache.mjs
 * Requires BLOB_READ_WRITE_TOKEN, STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN
 */
import { put } from "@vercel/blob"
import { createRequire } from "module"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env from .env.production
function loadEnv() {
  try {
    const envFile = readFileSync(resolve(__dirname, "../.env.production"), "utf8")
    for (const line of envFile.split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)="?([^"\n]*)"?$/)
      if (match) process.env[match[1]] = match[2]
    }
    console.log("✓ Loaded .env.production")
  } catch {
    console.log("! Could not load .env.production, using existing env")
  }
}

loadEnv()

const CLIENT_ID = process.env.STRAVA_CLIENT_ID
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !BLOB_TOKEN) {
  console.error("Missing required env vars:", { CLIENT_ID: !!CLIENT_ID, CLIENT_SECRET: !!CLIENT_SECRET, REFRESH_TOKEN: !!REFRESH_TOKEN, BLOB_TOKEN: !!BLOB_TOKEN })
  process.exit(1)
}

async function getToken() {
  console.log("→ Refreshing Strava access token...")
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  console.log(`✓ Token valid until ${new Date(data.expires_at * 1000).toISOString()}`)
  return data.access_token
}

async function fetchStrava(token) {
  const headers = { Authorization: `Bearer ${token}` }

  console.log("→ Fetching athlete...")
  const athleteRes = await fetch("https://www.strava.com/api/v3/athlete", { headers })
  if (!athleteRes.ok) throw new Error(`GET /athlete: ${athleteRes.status}`)
  const athlete = await athleteRes.json()
  console.log(`✓ Athlete: ${athlete.firstname} ${athlete.lastname} (id: ${athlete.id})`)

  console.log("→ Fetching stats + activities in parallel...")
  const [statsRes, activitiesRes] = await Promise.all([
    fetch(`https://www.strava.com/api/v3/athletes/${athlete.id}/stats`, { headers }),
    fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=100`, { headers }),
  ])

  if (!statsRes.ok) throw new Error(`GET /athletes/${athlete.id}/stats: ${statsRes.status} ${await statsRes.text()}`)
  if (!activitiesRes.ok) throw new Error(`GET /athlete/activities: ${activitiesRes.status} ${await activitiesRes.text()}`)

  const stats = await statsRes.json()
  const allActivities = await activitiesRes.json()
  const runs = allActivities.filter(a => a.type === "Run")
  console.log(`✓ Stats loaded. Activities: ${allActivities.length} total, ${runs.length} runs`)

  return { athlete, stats, allActivities: runs }
}

function computeStreaks(activities) {
  const seen = new Set()
  const uniqueDates = activities
    .map(a => a.start_date_local.substring(0, 10))
    .filter(d => { if (seen.has(d)) return false; seen.add(d); return true })
    .sort((a, b) => b.localeCompare(a))

  if (!uniqueDates.length) return { current: 0, longest: 0 }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().substring(0, 10)
  const yesterdayStr = new Date(today - 86400000).toISOString().substring(0, 10)

  let current = 0
  if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
    let check = new Date(uniqueDates[0])
    for (const d of uniqueDates) {
      if (d === check.toISOString().substring(0, 10)) {
        current++; check = new Date(check - 86400000)
      } else break
    }
  }

  let longest = 1, streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = Math.round((new Date(uniqueDates[i-1]) - new Date(uniqueDates[i])) / 86400000)
    if (diff === 1) streak++
    else { longest = Math.max(longest, streak); streak = 1 }
  }
  longest = Math.max(longest, streak)

  return { current, longest }
}

async function main() {
  const token = await getToken()
  const { athlete, stats, allActivities } = await fetchStrava(token)

  const payload = {
    athlete,
    stats,
    recentActivities: allActivities.slice(0, 20),
    streaks: computeStreaks(allActivities),
    cachedAt: new Date().toISOString(),
  }

  console.log(`→ Streaks: current=${payload.streaks.current}, longest=${payload.streaks.longest}`)
  console.log(`→ All-time runs: ${stats.all_run_totals.count}, distance: ${(stats.all_run_totals.distance/1000).toFixed(1)}km`)

  console.log("→ Writing strava/stats-cache.json to Vercel Blob...")
  const result = await put("strava/stats-cache.json", JSON.stringify(payload), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: BLOB_TOKEN,
  })
  console.log(`✓ Cache written: ${result.url}`)
  console.log("\n✅ Strava blob cache seeded successfully!")
}

main().catch(err => {
  console.error("✘ Failed:", err.message)
  process.exit(1)
})
