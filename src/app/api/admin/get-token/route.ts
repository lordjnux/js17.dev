import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"

/** Temporary endpoint — returns the admin's current OAuth tokens.
 *  Delete after use. */
export async function GET(req: NextRequest) {
  const token = await verifyAdmin(req)
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    accessTokenExpires: token.accessTokenExpires,
    email: token.email,
  })
}
