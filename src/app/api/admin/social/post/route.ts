import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { getLinkedInToken, appendPostHistory } from "@/lib/social"
import type { NextRequest } from "next/server"
import type { SocialPostLog } from "@/lib/social"

interface PostRequest {
  platforms: ("x" | "linkedin-personal" | "linkedin-page")[]
  content: {
    x?: string
    linkedinPersonal?: string
    linkedinPage?: string
  }
  linkedinPageUrn?: string
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body: PostRequest = await req.json()
  const { platforms, content, linkedinPageUrn } = body

  const results: SocialPostLog["results"] = []

  // ── X.com (Twitter API v2 via OAuth 1.0a) ──────────────────────────────
  if (platforms.includes("x") && content.x) {
    try {
      const { TwitterApi } = await import("twitter-api-v2")
      const client = new TwitterApi({
        appKey: process.env.X_API_KEY!,
        appSecret: process.env.X_API_SECRET!,
        accessToken: process.env.X_ACCESS_TOKEN!,
        accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
      })
      const tweet = await client.v2.tweet(content.x)
      results.push({
        platform: "x",
        success: true,
        url: `https://x.com/i/web/status/${tweet.data.id}`,
      })
    } catch (e) {
      results.push({ platform: "x", success: false, error: String(e) })
    }
  }

  // ── LinkedIn Personal ──────────────────────────────────────────────────
  if (platforms.includes("linkedin-personal") && content.linkedinPersonal) {
    try {
      const token = await getLinkedInToken()
      if (!token) throw new Error("LinkedIn not connected — visit /admin/social to authorize")

      const body = {
        author: token.person_urn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content.linkedinPersonal },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }

      const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(body),
      })

      if (!postRes.ok) {
        const err = await postRes.text()
        throw new Error(`LinkedIn API ${postRes.status}: ${err}`)
      }

      const postData = await postRes.json()
      const postId = postData.id?.replace("urn:li:ugcPost:", "")
      results.push({
        platform: "linkedin-personal",
        success: true,
        url: postId ? `https://www.linkedin.com/feed/update/urn:li:ugcPost:${postId}` : undefined,
      })
    } catch (e) {
      results.push({ platform: "linkedin-personal", success: false, error: String(e) })
    }
  }

  // ── LinkedIn Company Page ──────────────────────────────────────────────
  if (platforms.includes("linkedin-page") && content.linkedinPage) {
    try {
      const token = await getLinkedInToken()
      if (!token) throw new Error("LinkedIn not connected")
      const pageUrn = linkedinPageUrn || process.env.LINKEDIN_PAGE_URN
      if (!pageUrn) throw new Error("LINKEDIN_PAGE_URN not configured")

      const body = {
        author: pageUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content.linkedinPage },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }

      const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(body),
      })

      if (!postRes.ok) {
        const err = await postRes.text()
        throw new Error(`LinkedIn Page API ${postRes.status}: ${err}`)
      }

      const postData = await postRes.json()
      const postId = postData.id?.replace("urn:li:ugcPost:", "")
      results.push({
        platform: "linkedin-page",
        success: true,
        url: postId ? `https://www.linkedin.com/feed/update/urn:li:ugcPost:${postId}` : undefined,
      })
    } catch (e) {
      results.push({ platform: "linkedin-page", success: false, error: String(e) })
    }
  }

  // Log to history
  await appendPostHistory({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    platforms,
    content,
    results,
  })

  const allSucceeded = results.every((r) => r.success)
  return NextResponse.json(
    { results, allSucceeded },
    { status: allSucceeded ? 200 : 207 }
  )
}
