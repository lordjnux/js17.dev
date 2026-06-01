import { NextResponse } from "next/server"
import { saveLinkedInToken } from "@/lib/social"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin/social?error=linkedin_denied`)
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID!
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/linkedin/callback`

  // Exchange code for access token
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin/social?error=linkedin_token`)
  }

  const tokenData = await tokenRes.json()
  const accessToken: string = tokenData.access_token
  const expiresIn: number = tokenData.expires_in ?? 5184000 // 60 days default

  // Get person URN via userinfo endpoint
  const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  let personUrn = ""
  if (userRes.ok) {
    const user = await userRes.json()
    personUrn = user.sub ? `urn:li:person:${user.sub}` : ""
  }

  await saveLinkedInToken({
    access_token: accessToken,
    expires_at: Date.now() + expiresIn * 1000,
    person_urn: personUrn,
  })

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin/social?connected=linkedin`)
}
