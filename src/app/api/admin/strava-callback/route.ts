import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import type { StravaTokenCache } from "@/types/strava"

const TOKEN_CACHE = "strava/token-cache.json"

// GET /api/admin/strava-callback — handles Strava OAuth callback
// Strava redirects here after admin authorization; no session check possible
// because Strava redirects directly (not via the admin browser session).
// We verify the client_secret is present as proof of server ownership.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(
      `/admin/youtube?strava=error&reason=${encodeURIComponent(error)}`
    )
  }

  if (!code) {
    return NextResponse.json({ error: "Missing code param" }, { status: 400 })
  }

  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Strava not configured" }, { status: 500 })
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    return NextResponse.json(
      { error: "Token exchange failed", detail: text },
      { status: 502 }
    )
  }

  const data = await tokenRes.json()

  const tokenCache: StravaTokenCache = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  }

  // Persist token to blob so all future requests reuse it
  await put(TOKEN_CACHE, JSON.stringify(tokenCache), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  // Trigger stats cache refresh
  try {
    const { refreshStravaCache } = await import("@/lib/strava")
    await refreshStravaCache()
    revalidatePath("/hobbies")
  } catch {
    // Non-fatal — token is saved; cron will populate cache
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://js17.dev"
  ).trim()
  return NextResponse.redirect(`${baseUrl}/hobbies?strava=connected`)
}
