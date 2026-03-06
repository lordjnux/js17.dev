import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const shotstackEnv = process.env.SHOTSTACK_ENV || "stage"
  const res = await fetch(`https://api.shotstack.io/${shotstackEnv}/render/${params.jobId}`, {
    headers: { "x-api-key": process.env.SHOTSTACK_API_KEY! },
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }

  const { status, url } = data.response
  return NextResponse.json({ status, url: url || null })
}
