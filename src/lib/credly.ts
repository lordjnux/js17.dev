import { list, put } from "@vercel/blob"

export interface CredlyBadge {
  id: string
  issued_at: string
  badge_template: {
    name: string
    description: string
    image_url: string
    skills: { name: string }[]
    issuer: {
      name: string
      summary: string
    }
  }
}

interface CredlyResponse {
  data: CredlyBadge[]
  metadata: {
    total_count: number
    current_page: number
    total_pages: number
  }
}

const CACHE_PATHNAME = "credly/badges-cache.json"

async function fetchFromCredly(username: string): Promise<CredlyBadge[]> {
  const res = await fetch(
    `https://www.credly.com/users/${username}/badges.json?page=1&page_size=50&sort=-state_updated_at`,
    { headers: { Accept: "application/json" }, cache: "no-store" }
  )
  if (!res.ok) return []
  const json: CredlyResponse = await res.json()
  return json.data ?? []
}

export async function getCredlyBadges(username: string): Promise<CredlyBadge[]> {
  if (!username) return []

  // Try Blob cache first
  try {
    const { blobs } = await list({ prefix: CACHE_PATHNAME })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      if (res.ok) {
        const cached = await res.json()
        if (Array.isArray(cached) && cached.length > 0) return cached
      }
    }
  } catch {
    // fall through to direct fetch
  }

  // Fallback: fetch directly from Credly
  try {
    return await fetchFromCredly(username)
  } catch {
    return []
  }
}

export async function refreshCredlyCache(username: string): Promise<CredlyBadge[]> {
  const badges = await fetchFromCredly(username)
  if (badges.length > 0) {
    await put(CACHE_PATHNAME, JSON.stringify(badges), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  }
  return badges
}
