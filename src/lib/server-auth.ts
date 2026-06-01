import { decode } from "next-auth/jwt"
import { cookies } from "next/headers"
import { ADMIN_EMAIL } from "@/lib/auth"

export async function getAdminToken() {
  const secret = (process.env.NEXTAUTH_SECRET || "").trim()
  if (!secret) return null
  const cookieStore = await cookies()
  const sessionToken =
    cookieStore.get("__Secure-next-auth.session-token")?.value ??
    cookieStore.get("next-auth.session-token")?.value
  if (!sessionToken) return null
  try {
    const decoded = await decode({ token: sessionToken, secret })
    if (!decoded || decoded.email !== ADMIN_EMAIL) return null
    return decoded
  } catch {
    return null
  }
}
