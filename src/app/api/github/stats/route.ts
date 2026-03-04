import { NextResponse } from "next/server"
import { getGitHubStats } from "@/lib/github"

export const revalidate = 3600

export async function GET() {
  try {
    const stats = await getGitHubStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("GitHub stats error:", error)
    return NextResponse.json({ error: "Failed to fetch GitHub stats" }, { status: 500 })
  }
}
