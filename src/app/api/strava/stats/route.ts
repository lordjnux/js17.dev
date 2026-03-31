import { NextResponse } from "next/server"
import { getStravaStats } from "@/lib/strava"

export async function GET() {
  const stats = await getStravaStats()
  if (!stats) {
    return NextResponse.json({ error: "Strava not configured" }, { status: 503 })
  }
  return NextResponse.json(stats)
}
