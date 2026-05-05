import { NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { getResend } from "@/lib/resend"
import { legalVersionString } from "@/lib/legal"
import dns from "dns"
import { promisify } from "util"

const resolveMx = promisify(dns.resolveMx)

// ─── Email template ───────────────────────────────────────────────────────────

function buildConfirmationEmail(siteUrl: string): string {
  const rows = [
    'Say "Hey Jack" — no screen, no button, just your voice',
    "Report a hazard or checkpoint instantly — every nearby driver hears it",
    "Get warned before you reach a police stop, accident, or road hazard",
    "Bluetooth auto-start — Jack turns on when your car does",
    "Navigation turns read aloud — eyes always on the road",
  ]
  const featureRows = rows
    .map((f) => `<p style="margin:0 0 8px;font-size:13px;color:#9ca3af;padding-left:12px;border-left:2px solid #16c784;">${f}</p>`)
    .join("")

  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "<title>You are on the Jack waitlist</title>",
    "</head>",
    `<body style="margin:0;padding:0;background:#0b0b1e;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;">`,
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">`,
    `<tr><td align="center" style="padding:32px 16px 40px;">`,
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;">`,
    `<tr><td style="height:3px;background:linear-gradient(90deg,#16c784,#4a9eff);font-size:0;">&nbsp;</td></tr>`,
    `<tr><td style="background:#10102a;padding:36px 36px 28px;border:1px solid #1e1e40;border-top:none;">`,
    `<p style="margin:0 0 4px;font-size:22px;font-weight:900;letter-spacing:6px;color:#e0e0e0;">JACK</p>`,
    `<p style="margin:0 0 28px;font-size:11px;font-weight:600;letter-spacing:3px;color:#16c784;text-transform:uppercase;">Driver Assistant</p>`,
    `<h1 style="margin:0 0 14px;font-size:20px;font-weight:800;color:#e0e0e0;">You are on the list.</h1>`,
    `<p style="margin:0 0 24px;font-size:14px;color:#9ca3af;line-height:1.7;">Jack v1.0 is heading to Google Play. The moment it is ready, you will be the first to know. One email. No noise.</p>`,
    `<p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:2px;color:#4a9eff;text-transform:uppercase;">What Jack does</p>`,
    featureRows,
    `<p style="margin:28px 0 2px;font-size:13px;font-weight:700;color:#e0e0e0;">Jeroham Sanchez</p>`,
    `<p style="margin:0;font-size:12px;color:#6b7280;">Builder of Jack &mdash; <a href="${siteUrl}" style="color:#6b7280;text-decoration:none;">js17.dev</a></p>`,
    "</td></tr>",
    `<tr><td style="padding:14px 8px;text-align:center;">`,
    `<p style="margin:0;font-size:11px;color:#4b5563;line-height:1.6;">You joined the Jack waitlist at js17.dev.<br>`,
    `<a href="${siteUrl}/legal/privacy" style="color:#4b5563;">Privacy Policy</a> &nbsp;&middot;&nbsp; <a href="${siteUrl}/legal/habeas-data" style="color:#4b5563;">Habeas Data Policy</a></p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "</table>",
    "</body>",
    "</html>",
  ].join("\n")
}

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

// ─── Handler ──────────────────────────────────────────────────────────────────

const BLOB_PATH = "jack/waitlist.json"

type WaitlistEntry = { email: string; intention: string; joinedAt: string; legalVersion: string }

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

  // Read existing waitlist — same pattern as working newsletter route
  let waitlist: WaitlistEntry[] = []
  try {
    const { blobs } = await list({ prefix: BLOB_PATH })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      if (res.ok) {
        const raw: unknown = await res.json()
        waitlist = Array.isArray(raw) ? (raw as WaitlistEntry[]) : []
      }
    }
  } catch {
    waitlist = []
  }

  if (waitlist.some((e) => e.email === email)) {
    return NextResponse.json({ message: "You are already on the list. We will be in touch." })
  }

  waitlist.push({
    email,
    intention: intention as string,
    joinedAt: new Date().toISOString(),
    legalVersion: legalVersionString(),
  })

  // Write waitlist — same pattern as working newsletter route
  try {
    await put(BLOB_PATH, JSON.stringify(waitlist), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  } catch (err) {
    console.error("[jack/waitlist] put failed:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }

  // Send emails — never blocks the success response
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = getResend()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev"
      const from = "Jeroham @ js17.dev <news@js17.dev>"

      resend.emails.send({
        from,
        to: email,
        subject: "You are on the Jack waitlist",
        html: buildConfirmationEmail(siteUrl),
        text: `You are on the Jack waitlist.\n\nJack v1.0 is on its way to the Google Play Store. You will hear from us.\n\n— Jeroham Sanchez\nhttps://js17.dev`,
      }).catch(() => {})

      if ((intention === "investor" || intention === "both") && process.env.RESEND_TO_EMAIL) {
        const label = intention === "both" ? "Investor + Tester" : "Investor"
        resend.emails.send({
          from,
          to: process.env.RESEND_TO_EMAIL,
          subject: `Jack waitlist — new ${label}: ${email}`,
          text: `New Jack waitlist signup.\n\nEmail: ${email}\nRole: ${label}\nTime: ${new Date().toISOString()}`,
        }).catch(() => {})
      }
    } catch {
      // email errors never affect the response
    }
  }

  return NextResponse.json({ message: "You are on the list." })
}
