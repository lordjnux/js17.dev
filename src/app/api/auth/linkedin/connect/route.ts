import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clientId = process.env.LINKEDIN_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: "LINKEDIN_CLIENT_ID not set" }, { status: 500 })

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/linkedin/callback`
  const scope = "openid profile email w_member_social w_organization_social"

  const url = new URL("https://www.linkedin.com/oauth/v2/authorization")
  url.searchParams.set("response_type", "code")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("scope", scope)
  url.searchParams.set("state", "linkedin_connect")

  return NextResponse.redirect(url.toString())
}
