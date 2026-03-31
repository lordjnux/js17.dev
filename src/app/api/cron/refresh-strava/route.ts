import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { refreshStravaCache } from "@/lib/strava"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.STRAVA_CLIENT_ID) {
    return NextResponse.json({ error: "STRAVA_CLIENT_ID not configured" }, { status: 500 })
  }

  try {
    const data = await refreshStravaCache()
    revalidatePath("/hobbies")
    return NextResponse.json({
      message: "Strava stats refreshed",
      cachedAt: data.cachedAt,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to refresh Strava stats", detail: String(err) },
      { status: 500 }
    )
  }
}
