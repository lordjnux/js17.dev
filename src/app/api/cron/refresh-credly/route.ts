import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { refreshCredlyCache } from "@/lib/credly"
import { refreshStravaCache } from "@/lib/strava"
import { refreshChessCache } from "@/lib/chess"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const username = (process.env.CREDLY_USERNAME || "").trim()
  if (!username) {
    return NextResponse.json({ error: "CREDLY_USERNAME not configured" }, { status: 500 })
  }

  const results: Record<string, unknown> = {}

  // Credly
  try {
    const badges = await refreshCredlyCache(username)
    revalidatePath("/")
    results.credly = { count: badges.length }
  } catch (err) {
    results.credly = { error: String(err) }
  }

  // Strava (only if configured)
  if (process.env.STRAVA_CLIENT_ID) {
    try {
      const strava = await refreshStravaCache()
      revalidatePath("/hobbies")
      results.strava = { cachedAt: strava.cachedAt }
    } catch (err) {
      results.strava = { error: String(err) }
    }
  }

  // Chess (always — public API, no auth needed)
  try {
    const chess = await refreshChessCache()
    revalidatePath("/hobbies")
    results.chess = { cachedAt: chess.cachedAt }
  } catch (err) {
    results.chess = { error: String(err) }
  }

  return NextResponse.json({
    message: "Caches refreshed",
    refreshedAt: new Date().toISOString(),
    ...results,
  })
}
