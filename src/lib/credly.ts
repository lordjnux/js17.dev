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

export async function getCredlyBadges(username: string): Promise<CredlyBadge[]> {
  if (!username) return []
  try {
    const res = await fetch(
      `https://www.credly.com/users/${username}/badges.json?page=1&page_size=50&sort=-state_updated_at`,
      {
        next: { revalidate: 86400 }, // cache 24h
        headers: { Accept: "application/json" },
      }
    )
    if (!res.ok) return []
    const json: CredlyResponse = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}
