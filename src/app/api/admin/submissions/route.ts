import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, ADMIN_EMAIL } from "@/lib/auth"
import { list } from "@vercel/blob"
import type { SubmissionRecord } from "@/lib/moderation"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { blobs } = await list({ prefix: "moderation/submissions.json" })
    if (blobs.length === 0) {
      return NextResponse.json({ records: [], stats: { total: 0, flagged: 0, sent: 0, blocked: 0 } })
    }

    const res = await fetch(blobs[0].url, { cache: "no-store" })
    const records: SubmissionRecord[] = await res.json()

    const stats = {
      total: records.length,
      flagged: records.filter((r) => r.flagged).length,
      sent: records.filter((r) => r.action === "sent").length,
      blocked: records.filter((r) => r.action === "blocked").length,
    }

    return NextResponse.json({ records, stats })
  } catch {
    return NextResponse.json({ error: "Failed to load submissions" }, { status: 500 })
  }
}
