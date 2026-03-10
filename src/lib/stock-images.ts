export interface StockImage {
  url: string
  photographer?: string
  source: "pexels" | "pixabay"
}

export async function fetchRelevantImages(
  query: string,
  count: number = 2,
  orientation: "landscape" | "portrait" = "landscape"
): Promise<StockImage[]> {
  const results: StockImage[] = []

  // Try Pexels first
  if (process.env.PEXELS_API_KEY) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=${orientation}&size=medium&per_page=${count}`,
        { headers: { Authorization: process.env.PEXELS_API_KEY } }
      )
      if (res.ok) {
        const data = await res.json()
        const photos: Array<{ src: { large2x: string }; photographer: string }> = data.photos || []
        for (const photo of photos.slice(0, count)) {
          results.push({ url: photo.src.large2x, photographer: photo.photographer, source: "pexels" })
        }
      }
    } catch {}
  }

  // Fallback to Pixabay if not enough results
  if (results.length < count && process.env.PIXABAY_API_KEY) {
    try {
      const needed = count - results.length
      const res = await fetch(
        `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${needed + 3}`
      )
      if (res.ok) {
        const data = await res.json()
        const hits: Array<{ largeImageURL: string }> = data.hits || []
        for (const hit of hits.slice(0, needed)) {
          results.push({ url: hit.largeImageURL, source: "pixabay" })
        }
      }
    } catch {}
  }

  return results
}

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "should", "could", "may", "might", "can",
  "from", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then", "once",
  "how", "why", "when", "what", "where", "who", "your", "my", "our", "their",
])

export function deriveImageQuery(title: string, tags: string[]): string {
  const titleWords = title
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w.toLowerCase()))
    .slice(0, 3)

  const tagWords = tags
    .filter(t => !STOPWORDS.has(t.toLowerCase()) && t.length > 2)
    .slice(0, 2)

  const seen = new Set<string>()
  const combined: string[] = []
  for (const w of [...tagWords, ...titleWords]) {
    const lower = w.toLowerCase()
    if (!seen.has(lower)) {
      seen.add(lower)
      combined.push(w)
    }
  }

  return combined.slice(0, 3).join(" ") || "technology abstract"
}
