import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { refreshCredlyCache } from "@/lib/credly"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const username = (process.env.CREDLY_USERNAME || "").trim()
  if (!username) {
    return NextResponse.json({ error: "CREDLY_USERNAME not configured" }, { status: 500 })
  }

  try {
    const badges = await refreshCredlyCache(username)
    revalidatePath("/")
    return NextResponse.json({
      message: "Credly badges refreshed",
      count: badges.length,
      refreshedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "Failed to refresh Credly badges" }, { status: 500 })
  }
}
