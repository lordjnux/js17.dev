import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { ADMIN_EMAIL } from "@/lib/auth"

/**
 * Diagnostic endpoint — returns auth state without exposing secrets.
 * DELETE THIS after debugging is complete.
 */
export async function GET(req: NextRequest) {
  const secret = (process.env.NEXTAUTH_SECRET || "").trim()

  const cookieNames = req.cookies.getAll().map((c) => c.name)
  const hasSessionCookie = cookieNames.some((n) =>
    n.includes("next-auth.session-token")
  )

  let tokenResult: string = "not_attempted"
  let tokenEmail: string | null = null
  let emailMatch = false

  if (!secret) {
    tokenResult = "no_secret"
  } else {
    try {
      const token = await getToken({ req, secret })
      if (!token) {
        tokenResult = "null_token"
      } else {
        tokenResult = "ok"
        tokenEmail = (token.email as string) || null
        emailMatch = tokenEmail === ADMIN_EMAIL
      }
    } catch (e) {
      tokenResult = `error: ${e instanceof Error ? e.message : "unknown"}`
    }
  }

  return NextResponse.json({
    cookieNames,
    hasSessionCookie,
    adminEmail: ADMIN_EMAIL,
    adminEmailLength: ADMIN_EMAIL.length,
    tokenResult,
    tokenEmail,
    emailMatch,
    hasSecret: !!secret,
    secretLength: secret.length,
    nextauthUrl: process.env.NEXTAUTH_URL || "(not set)",
    vercelEnv: process.env.VERCEL || "(not set)",
    nodeEnv: process.env.NODE_ENV,
  })
}
