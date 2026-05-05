import { NextRequest, NextResponse } from "next/server"
import { getResend } from "@/lib/resend"
import dns from "dns"
import { promisify } from "util"

const resolveMx = promisify(dns.resolveMx)

// ─── Disposable domain blocklist ──────────────────────────────────────────────

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "temp-mail.org", "throwam.com",
  "yopmail.com", "trashmail.com", "fakeinbox.com", "sharklasers.com",
  "guerrillamailblock.com", "grr.la", "guerrillamail.info", "dispostable.com",
  "maildrop.cc", "tempr.email", "10minutemail.com", "tempmail.com",
  "getnada.com", "spamgourmet.com", "mailnull.com", "spamspot.com",
  "throwaway.email", "spam4.me", "trashmail.me", "getairmail.com",
])

// ─── Rate limit: 3 per hour per IP ───────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3_600_000 })
    return true
  }
  if (record.count >= 3) return false
  record.count++
  return true
}

// ─── MX check ─────────────────────────────────────────────────────────────────

async function hasMxRecord(domain: string): Promise<boolean> {
  try {
    const check = new Promise<boolean>((resolve) => {
      resolveMx(domain)
        .then((mx) => resolve(mx.length > 0))
        .catch((err: NodeJS.ErrnoException) => resolve(err.code !== "ENOTFOUND"))
    })
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 4000))
    return await Promise.race([check, timeout])
  } catch {
    return true
  }
}

const INTENTION_LABELS: Record<string, string> = {
  tester:   "Early Tester",
  investor: "Investor",
  both:     "Early Tester + Investor",
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const intention = body?.intention
  if (intention !== "tester" && intention !== "investor" && intention !== "both") {
    return NextResponse.json(
      { error: "Please select how you would like to be involved with Jack." },
      { status: 422 }
    )
  }

  if (body?.legalAccepted !== true) {
    return NextResponse.json(
      { error: "You must accept the Privacy Policy and Habeas Data Policy to join." },
      { status: 422 }
    )
  }

  const rawEmail = body?.email
  if (typeof rawEmail !== "string" || !rawEmail.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 })
  }

  const email = rawEmail.toLowerCase().trim()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "That does not look like a valid email address." }, { status: 422 })
  }

  const domain = email.split("@")[1]

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json({ error: "Disposable email addresses are not accepted." }, { status: 422 })
  }

  const mxValid = await hasMxRecord(domain)
  if (!mxValid) {
    return NextResponse.json({ error: "That email domain does not appear to be valid." }, { status: 422 })
  }

  // Send notification email to Jeroham — this is the only storage mechanism
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }

  try {
    const resend = getResend()
    const intentionLabel = INTENTION_LABELS[intention as string] ?? intention as string
    const timestamp = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "full", timeStyle: "short" })

    await resend.emails.send({
      from: "Jack Waitlist <news@js17.dev>",
      to: "jeroham.sanchez@gmail.com",
      subject: `Jack waitlist — ${intentionLabel}: ${email}`,
      html: [
        `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0b0b1e;border:1px solid #1e1e40;border-radius:12px;">`,
        `<p style="margin:0 0 4px;font-size:20px;font-weight:900;letter-spacing:5px;color:#e0e0e0;">JACK</p>`,
        `<p style="margin:0 0 28px;font-size:11px;letter-spacing:3px;color:#16c784;text-transform:uppercase;">New waitlist signup</p>`,
        `<table style="width:100%;border-collapse:collapse;">`,
        `<tr><td style="padding:10px 14px;font-size:12px;color:#6b7280;border-bottom:1px solid #1e1e40;white-space:nowrap;">EMAIL</td><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#e0e0e0;border-bottom:1px solid #1e1e40;">${email}</td></tr>`,
        `<tr><td style="padding:10px 14px;font-size:12px;color:#6b7280;border-bottom:1px solid #1e1e40;white-space:nowrap;">INTENTION</td><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#16c784;border-bottom:1px solid #1e1e40;">${intentionLabel}</td></tr>`,
        `<tr><td style="padding:10px 14px;font-size:12px;color:#6b7280;white-space:nowrap;">TIME</td><td style="padding:10px 14px;font-size:13px;color:#9ca3af;">${timestamp}</td></tr>`,
        `</table>`,
        `</div>`,
      ].join(""),
      text: `New Jack waitlist signup\n\nEmail: ${email}\nIntention: ${intentionLabel}\nTime: ${timestamp}`,
    })
  } catch (err) {
    console.error("[jack/waitlist] email send failed:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }

  return NextResponse.json({ message: "You are on the list." })
}
