import { NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import crypto from "crypto"

function verifyToken(email: string, token: string): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET || "fallback")
    .update(email)
    .digest("base64url")
  return expected === token
}

async function removeSubscriber(email: string): Promise<boolean> {
  const { blobs } = await list({ prefix: "newsletter/subscribers.json" })
  if (blobs.length === 0) return false

  const res = await fetch(blobs[0].url, { cache: "no-store" })
  const raw = await res.json().catch(() => [])
  if (!Array.isArray(raw)) return false

  type Subscriber = { email: string; [key: string]: unknown }
  const subscribers: Subscriber[] = raw.map((r) =>
    typeof r === "string" ? { email: r } : r
  )
  const filtered = subscribers.filter((s) => s.email !== email)

  if (filtered.length === raw.length) return false // wasn't subscribed

  await put("newsletter/subscribers.json", JSON.stringify(filtered), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  })
  return true
}

// GET: browser unsubscribe — redirects to confirmation page
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  const token = searchParams.get("token")

  if (!email || !token || !verifyToken(email, token)) {
    return NextResponse.redirect(
      new URL("/newsletter/unsubscribe?status=invalid", req.url)
    )
  }

  await removeSubscriber(email)
  return NextResponse.redirect(
    new URL(`/newsletter/unsubscribe?status=success&email=${encodeURIComponent(email)}`, req.url)
  )
}

// POST: one-click unsubscribe per RFC 8058 (email client "Unsubscribe" button)
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  const token = searchParams.get("token")

  if (!email || !token || !verifyToken(email, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  await removeSubscriber(email)
  return NextResponse.json({ success: true })
}
