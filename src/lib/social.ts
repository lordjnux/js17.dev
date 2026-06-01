import { list, put } from "@vercel/blob"

export interface LinkedInToken {
  access_token: string
  expires_at: number
  person_urn: string
}

export interface SocialPostLog {
  id: string
  timestamp: string
  platforms: string[]
  content: {
    x?: string
    linkedinPersonal?: string
    linkedinPage?: string
  }
  results: {
    platform: string
    success: boolean
    url?: string
    error?: string
  }[]
}

const LINKEDIN_TOKEN_KEY = "social/linkedin-token.json"
const POST_HISTORY_KEY = "social/post-history.json"

// ─── LinkedIn token helpers ────────────────────────────────────────────────

export async function getLinkedInToken(): Promise<LinkedInToken | null> {
  try {
    const { blobs } = await list({ prefix: LINKEDIN_TOKEN_KEY })
    if (blobs.length === 0) return null
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    if (!res.ok) return null
    const token: LinkedInToken = await res.json()
    if (Date.now() > token.expires_at - 60_000) return null // expired
    return token
  } catch {
    return null
  }
}

export async function saveLinkedInToken(token: LinkedInToken): Promise<void> {
  await put(LINKEDIN_TOKEN_KEY, JSON.stringify(token), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

// ─── Post history ─────────────────────────────────────────────────────────

export async function appendPostHistory(entry: SocialPostLog): Promise<void> {
  try {
    let history: SocialPostLog[] = []
    const { blobs } = await list({ prefix: POST_HISTORY_KEY })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      if (res.ok) history = await res.json()
    }
    history.unshift(entry)
    if (history.length > 100) history = history.slice(0, 100)
    await put(POST_HISTORY_KEY, JSON.stringify(history), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  } catch {
    // Best-effort logging
  }
}

export async function getPostHistory(): Promise<SocialPostLog[]> {
  try {
    const { blobs } = await list({ prefix: POST_HISTORY_KEY })
    if (blobs.length === 0) return []
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
