import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, ADMIN_EMAIL } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const res = await fetch(`https://api.shotstack.io/v1/render/${params.jobId}`, {
    headers: { "x-api-key": process.env.SHOTSTACK_API_KEY! },
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }

  const { status, url } = data.response
  return NextResponse.json({ status, url: url || null })
}
