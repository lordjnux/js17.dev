import { put, list } from "@vercel/blob"

export interface ModerationResult {
  flagged: boolean
  reason: string | null
  categories: Record<string, boolean>
  scores: Record<string, number>
  source: "openai" | "keyword" | "clean"
}

export interface SubmissionRecord {
  id: string
  timestamp: string
  flagged: boolean
  action: "sent" | "blocked"
  reason: string | null
  categories: Record<string, boolean>
  scores: Record<string, number>
  source: "openai" | "keyword" | "clean"
  // Minimal excerpt for observability (no full PII stored)
  excerpt: string
  clientName: string
  company: string
  projectTitle: string
  contactEmail: string
  termsVersion?: string
}

// Hardcoded base blocklist — seeded from real abuse case
const BASE_BLOCKLIST = [
  "stupid", "dont disturb", "who cares", "careessss", "idiot", "moron",
  "dumb", "hate", "kill", "die", "racist", "discrimination", "harassment",
]

async function getCustomBlocklist(): Promise<string[]> {
  try {
    const { blobs } = await list({ prefix: "moderation/blocklist.json" })
    if (blobs.length === 0) return []
    const res = await fetch(blobs[0].url)
    return await res.json()
  } catch {
    return []
  }
}

async function saveCustomBlocklist(terms: string[]): Promise<void> {
  await put("moderation/blocklist.json", JSON.stringify(Array.from(new Set(terms))), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

// Extract likely abusive terms from high-confidence flagged text
function extractBlocklistTerms(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3)
    .slice(0, 10) // cap to avoid noise
}

function checkKeywords(text: string, blocklist: string[]): { flagged: boolean; reason: string | null } {
  const lower = text.toLowerCase()
  const combined = [...BASE_BLOCKLIST, ...blocklist]
  const hit = combined.find((term) => lower.includes(term.toLowerCase()))
  return hit
    ? { flagged: true, reason: `Blocked keyword detected: "${hit}"` }
    : { flagged: false, reason: null }
}

export async function moderateContent(text: string): Promise<ModerationResult> {
  const customBlocklist = await getCustomBlocklist()

  // Layer 1: keyword check (fast, free, no API needed)
  const kwCheck = checkKeywords(text, customBlocklist)
  if (kwCheck.flagged) {
    return {
      flagged: true,
      reason: kwCheck.reason,
      categories: { "custom-keyword": true },
      scores: { "custom-keyword": 1.0 },
      source: "keyword",
    }
  }

  // Layer 2: OpenAI Moderation API (free endpoint)
  if (!process.env.OPENAI_API_KEY) {
    return { flagged: false, reason: null, categories: {}, scores: {}, source: "clean" }
  }

  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ input: text }),
    })

    if (!res.ok) throw new Error("Moderation API error")

    const data = await res.json()
    const result = data.results[0]

    if (result.flagged) {
      // Autonomous learning: add extracted terms to custom blocklist for future fast-path checks
      const newTerms = extractBlocklistTerms(text)
      if (newTerms.length > 0) {
        const updated = [...customBlocklist, ...newTerms]
        await saveCustomBlocklist(updated).catch(() => {}) // non-blocking
      }

      return {
        flagged: true,
        reason: `Content policy violation: ${Object.entries(result.categories as Record<string,boolean>)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(", ")}`,
        categories: result.categories,
        scores: result.category_scores,
        source: "openai",
      }
    }

    return {
      flagged: false,
      reason: null,
      categories: result.categories,
      scores: result.category_scores,
      source: "clean",
    }
  } catch {
    // Moderation API unavailable — fall through (fail open, don't block legit proposals)
    return { flagged: false, reason: null, categories: {}, scores: {}, source: "clean" }
  }
}

export async function recordSubmission(record: SubmissionRecord): Promise<void> {
  try {
    const { blobs } = await list({ prefix: "moderation/submissions.json" })
    let records: SubmissionRecord[] = []
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url)
      records = await res.json()
    }
    records.unshift(record) // newest first
    // Keep last 500 records max
    if (records.length > 500) records = records.slice(0, 500)
    await put("moderation/submissions.json", JSON.stringify(records), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  } catch {
    // Non-blocking — don't fail the submission if storage fails
  }
}
