import { NextResponse } from "next/server"
import { list } from "@vercel/blob"
import type { StravaAIInsights } from "@/types/strava"

export const revalidate = 21600

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "strava/ai-insights.json" })
    if (blobs.length === 0) return NextResponse.json(null)
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    if (!res.ok) return NextResponse.json(null)
    const data: StravaAIInsights = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(null)
  }
}
