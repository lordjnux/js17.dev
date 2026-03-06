import { NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { getResend } from "@/lib/resend"
import { legalVersionString } from "@/lib/legal"
import dns from "dns"
import { promisify } from "util"

const resolveMx = promisify(dns.resolveMx)

function buildWelcomeEmailHtml(siteUrl: string): string {
  const blogUrl = `${siteUrl}/blog`
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Welcome to js17.dev</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:32px 16px 40px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:540px;width:100%;">
          <tr><td style="height:3px;border-radius:3px 3px 0 0;background:linear-gradient(90deg,#2563eb,#60a5fa);font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="background:#ffffff;border-radius:0 0 16px 16px;padding:36px 40px 32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <p style="margin:0 0 28px;font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:#2563eb;">js17.dev</p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;letter-spacing:-0.4px;">You're in. Welcome.</h1>
              <p style="margin:0 0 20px;font-size:16px;color:#334155;line-height:1.75;">
                Thanks for subscribing. You'll get an email whenever I publish a new article — no spam, no noise, just engineering content worth reading.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 28px;">
                <tr>
                  <td style="border-radius:8px;background:#2563eb;">
                    <a href="${blogUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">Browse the Blog &rarr;</a>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 24px;">
                <tr><td style="height:1px;background:#f1f5f9;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#0f172a;">Jeroham Sanchez</p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">Senior AI-Augmented Fullstack Engineer &mdash; <a href="${siteUrl}" style="color:#94a3b8;text-decoration:none;">js17.dev</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 8px 4px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.65;">
                You subscribed at js17.dev. If this was a mistake, simply ignore this email &mdash; you can unsubscribe from any future notification.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

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
      allowOverwrite: true,
    })

    // Welcome email (non-blocking)
    if (process.env.RESEND_API_KEY) {
      const resend = getResend()
      const from = process.env.RESEND_FROM_EMAIL || "Jeroham @ js17.dev <hello@js17.dev>"
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev"
      resend.emails.send({
        from,
        to: email,
        subject: "You're subscribed to js17.dev",
        html: buildWelcomeEmailHtml(siteUrl),
        text: `Welcome to js17.dev updates.\n\nYou'll receive an email whenever a new article is published.\n\nRead the blog: ${siteUrl}/blog\n\n— Jeroham Sanchez\n${siteUrl}`,
      }).catch(() => {})
    }

    return NextResponse.json({ message: "Subscribed" })
  } catch {
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 })
  }
}
