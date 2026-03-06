import { NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { getResend } from "@/lib/resend"
import { legalVersionString } from "@/lib/legal"
import dns from "dns"
import { promisify } from "util"

const resolveMx = promisify(dns.resolveMx)

// Disposable / throwaway email domain blocklist
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "temp-mail.org", "throwam.com",
  "yopmail.com", "trashmail.com", "fakeinbox.com", "sharklasers.com",
  "guerrillamailblock.com", "grr.la", "guerrillamail.info", "dispostable.com",
  "maildrop.cc", "tempr.email", "10minutemail.com", "tempmail.com",
  "getnada.com", "spamgourmet.com", "mailnull.com", "spamspot.com",
])

// Per-IP rate limit: 2 subscriptions per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3_600_000 })
    return true
  }
  if (record.count >= 2) return false
  record.count++
  return true
}

async function hasMxRecord(domain: string): Promise<boolean> {
  try {
    const check = new Promise<boolean>((resolve) => {
      resolveMx(domain)
        .then((mx) => resolve(mx.length > 0))
        .catch((err: NodeJS.ErrnoException) => {
          // Only block when domain provably doesn't exist.
          // For timeouts, SERVFAIL, or ENODATA give benefit of the doubt —
          // Vercel's Lambda DNS can fail on MX lookups for valid domains.
          resolve(err.code !== "ENOTFOUND")
        })
    })
    // Hard timeout: default to accepting if DNS is unresponsive
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 4000))
    return await Promise.race([check, timeout])
  } catch {
    return true
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const raw = (body as Record<string, unknown>)?.email
  if (typeof raw !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const termsAccepted = (body as Record<string, unknown>)?.termsAccepted
  if (termsAccepted !== true) {
    return NextResponse.json({ error: "You must accept the privacy policy to subscribe" }, { status: 422 })
  }

  // Normalize: lowercase + trim
  const email = raw.toLowerCase().trim()

  // RFC-style format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 422 })
  }

  const domain = email.split("@")[1]

  // Reject disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json({ error: "Disposable email addresses are not accepted" }, { status: 422 })
  }

  // MX record check — reject domains that don't accept email
  const mxValid = await hasMxRecord(domain)
  if (!mxValid) {
    return NextResponse.json({ error: "Email domain does not appear to be valid" }, { status: 422 })
  }

  try {
    const { blobs } = await list({ prefix: "newsletter/subscribers.json" })
    type SubscriberRecord = { email: string; subscribedAt: string; termsVersion: string }
    let subscribers: SubscriberRecord[] = []
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      const raw = await res.json()
      // support legacy plain-string array
      subscribers = Array.isArray(raw)
        ? raw.map((r) => (typeof r === "string" ? { email: r, subscribedAt: "", termsVersion: "legacy" } : r))
        : []
    }

    if (subscribers.some((s) => s.email === email)) {
      return NextResponse.json({ message: "Subscribed" })
    }

    subscribers.push({ email, subscribedAt: new Date().toISOString(), termsVersion: legalVersionString() })
    await put("newsletter/subscribers.json", JSON.stringify(subscribers), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    })

    // Welcome email (non-blocking)
    if (process.env.RESEND_API_KEY) {
      const resend = getResend()
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "js17.dev <hello@js17.dev>",
        to: email,
        subject: "You're subscribed to js17.dev",
        html: `<p>Thanks for subscribing to js17.dev.</p><p>You'll get notified when new articles are published.</p><p style="margin-top:24px;font-size:12px;color:#666">— Jeroham Sanchez · <a href="https://js17.dev">js17.dev</a></p>`,
      }).catch(() => {})
    }

    return NextResponse.json({ message: "Subscribed" })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: "Subscription failed", detail: msg }, { status: 500 })
  }
}
