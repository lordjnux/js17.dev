import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "jeroham.sanchez@gmail.com").trim()

/**
 * Use this in App Router route handlers instead of getServerSession.
 * getToken reads the JWT cookie directly from the request — reliable in all contexts.
 * Returns the token (including accessToken) when admin, null otherwise.
 */
export async function verifyAdmin(req: NextRequest) {
  const secret = (process.env.NEXTAUTH_SECRET || "").trim()
  if (!secret) return null
  let token = await getToken({ req, secret })
  if (!token || token.email !== ADMIN_EMAIL) return null

  // getToken reads the JWT directly and never fires the jwt callback refresh logic.
  // Refresh proactively if the access token is expired or within 5 min of expiry.
  const expiresAt = token.accessTokenExpires as number | undefined
  if (token.refreshToken && (!expiresAt || Date.now() > expiresAt - 5 * 60 * 1000)) {
    const refreshed = await refreshAccessToken(token.refreshToken as string)
    if (refreshed) token = { ...token, ...refreshed }
  }

  return token
}

async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; accessTokenExpires: number } | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw data
    return {
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
    }
  } catch {
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/youtube.upload",
            "https://www.googleapis.com/auth/youtube",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in — store tokens
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
        }
      }

      // Token still valid — return as-is
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Token expired — refresh
      if (!token.refreshToken) return token
      const refreshed = await refreshAccessToken(token.refreshToken as string)
      if (!refreshed) return token
      return { ...token, ...refreshed }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    },
  },
  secret: (process.env.NEXTAUTH_SECRET || "").trim(),
  pages: {
    signIn: "/auth/signin",
  },
}
