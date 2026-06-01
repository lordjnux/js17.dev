import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { getLinkedInToken, getPostHistory } from "@/lib/social"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [linkedinToken, history] = await Promise.all([
    getLinkedInToken(),
    getPostHistory(),
  ])

  const xConfigured = !!(
    process.env.X_API_KEY &&
    process.env.X_API_SECRET &&
    process.env.X_ACCESS_TOKEN &&
    process.env.X_ACCESS_TOKEN_SECRET
  )

  return NextResponse.json({
    platforms: {
      x: { connected: xConfigured, method: "oauth1a" },
      linkedinPersonal: {
        connected: !!linkedinToken,
        expiresAt: linkedinToken?.expires_at ?? null,
        personUrn: linkedinToken?.person_urn ?? null,
      },
      linkedinPage: {
        connected: !!linkedinToken && !!process.env.LINKEDIN_PAGE_URN,
        pageUrn: process.env.LINKEDIN_PAGE_URN ?? null,
      },
    },
    recentPosts: history.slice(0, 5),
  })
}
