import { list, put } from "@vercel/blob"
import type { ChessStats } from "@/types/chess"

const STATS_CACHE = "chess/stats-cache.json"
const CHESS_USERNAME = "jerohamsanchez"

async function fetchFromChessCom(isr = false): Promise<ChessStats> {
  const fetchOpts = isr
    ? { next: { revalidate: 21600 } }
    : { cache: "no-store" as const }

  const res = await fetch(
    `https://api.chess.com/pub/player/${CHESS_USERNAME}/stats`,
    {
      ...fetchOpts,
      headers: { "User-Agent": "js17.dev personal portfolio" },
    }
  )
  if (!res.ok) throw new Error(`Chess.com API failed: ${res.status}`)
  const data = await res.json()
  return { ...data, cachedAt: new Date().toISOString() }
}

export async function getChessStats(): Promise<ChessStats | null> {
  // Try Blob cache first
  try {
    const { blobs } = await list({ prefix: STATS_CACHE })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      if (res.ok) {
        const cached: ChessStats = await res.json()
        if (cached?.chess_blitz) return cached
      }
    }
  } catch {
    // fall through
  }

  // Fallback: fetch directly with ISR
  try {
    return await fetchFromChessCom(true)
  } catch {
    return null
  }
}

export async function refreshChessCache(): Promise<ChessStats> {
  const data = await fetchFromChessCom(false)
  await put(STATS_CACHE, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  return data
}
