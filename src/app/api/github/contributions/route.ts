import { NextResponse } from "next/server"
import { getContributions } from "@/lib/github"

export const revalidate = 3600

export async function GET() {
  try {
    const data = await getContributions()
    return NextResponse.json(data)
  } catch (error) {
    console.error("GitHub contributions error:", error)
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 })
  }
}
