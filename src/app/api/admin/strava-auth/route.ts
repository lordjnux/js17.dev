import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"

// GET /api/admin/strava-auth — redirects admin to Strava OAuth
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clientId = process.env.STRAVA_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: "STRAVA_CLIENT_ID not configured" }, { status: 500 })
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://js17.dev"
  ).trim()
  const redirectUri = `${baseUrl}/api/admin/strava-callback`

  const authUrl = new URL("https://www.strava.com/oauth/authorize")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("approval_prompt", "force")
  authUrl.searchParams.set("scope", "read,read_all,activity:read_all")

  return NextResponse.redirect(authUrl.toString())
}
