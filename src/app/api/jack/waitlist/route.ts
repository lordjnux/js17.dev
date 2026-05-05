import { NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { getResend } from "@/lib/resend"
import { legalVersionString } from "@/lib/legal"
import dns from "dns"
import { promisify } from "util"

const resolveMx = promisify(dns.resolveMx)

// ─── Email template ───────────────────────────────────────────────────────────

function buildConfirmationEmail(siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>You&apos;re on the Jack waitlist</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0b0b1e;">
    <tr>
      <td align="center" style="padding:32px 16px 40px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;width:100%;">
          <tr><td style="height:3px;border-radius:3px 3px 0 0;background:linear-gradient(90deg,#16c784,#4a9eff);font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="background:#10102a;border-radius:0 0 16px 16px;padding:36px 40px 32px;box-shadow:0 4px 40px rgba(0,0,0,0.4);border:1px solid #1e1e40;border-top:none;">
              <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:22px;font-weight:900;letter-spacing:6px;color:#e0e0e0;">JACK</p>
              <p style="margin:0 0 28px;font-size:11px;font-weight:600;letter-spacing:3px;color:#16c784;text-transform:uppercase;">Driver Assistant</p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#e0e0e0;line-height:1.3;letter-spacing:-0.4px;">You&apos;re on the list.</h1>
              <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.75;">
                Jack v1.0 is on its way to the Google Play Store. When it&apos;s ready, you&apos;ll be the first to know &mdash; one email, no noise.
              </p>
              <div style="background:#0b0b1e;border-radius:12px;border:1px solid #1e1e40;padding:20px 24px;margin:0 0 28px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:2px;color:#4a9eff;text-transform:uppercase;">What&apos;s coming in v1.0</p>
                ${[
                  "Wake word: say \"Hey Jack\" — no screen, no tap",
                  "Community road reports in real time via Firestore",
                  "GPS proximity alerts at 500m, 300m, 200m",
                  "Bluetooth auto-start when your car connects",
                  "Navigation relay from Google Maps / Waze",
                ].map(item => `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;display:flex;gap:8px;"><span style="color:#16c784;flex-shrink:0;">&#8250;</span> ${item}</p>`).join("")}
              </div>
              <p style="margin:28px 0 4px;font-size:13px;font-weight:700;color:#e0e0e0;">Jeroham Sanchez</p>
              <p style="margin:0;font-size:12px;color:#6b7280;">Builder of Jack &mdash; <a href="${siteUrl}" style="color:#6b7280;text-decoration:none;">js17.dev</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 8px 4px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#4b5563;line-height:1.65;">
                You joined the Jack waitlist at js17.dev/blog/jack-driver-assistant.<br>
                Your data is handled under our <a href="${siteUrl}/legal/privacy" style="color:#4b5563;">Privacy Policy</a> and <a href="${siteUrl}/legal/habeas-data" style="color:#4b5563;">Habeas Data Policy</a>.
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

// ─── Disposable domain blocklist ──────────────────────────────────────────────

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "temp-mail.org", "throwam.com",
  "yopmail.com", "trashmail.com", "fakeinbox.com", "sharklasers.com",
  "guerrillamailblock.com", "grr.la", "guerrillamail.info", "dispostable.com",
  "maildrop.cc", "tempr.email", "10minutemail.com", "tempmail.com",
  "getnada.com", "spamgourmet.com", "mailnull.com", "spamspot.com",
  "throwaway.email", "spam4.me", "trashmail.me", "getairmail.com",
])

// ─── Rate limiting: 3 attempts per hour per IP ────────────────────────────────

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
        .catch((err: NodeJS.ErrnoException) => {
          resolve(err.code !== "ENOTFOUND")
        })
    })
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 4000))
    return await Promise.race([check, timeout])
  } catch {
    return true
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const rawEmail = (body as Record<string, unknown>)?.email
  if (typeof rawEmail !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const legalAccepted = (body as Record<string, unknown>)?.legalAccepted
  if (legalAccepted !== true) {
    return NextResponse.json(
      { error: "You must accept the Privacy Policy and Habeas Data Policy to join." },
      { status: 422 }
    )
  }

  const email = rawEmail.toLowerCase().trim()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "That doesn't look like a valid email address." }, { status: 422 })
  }

  const domain = email.split("@")[1]

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json({ error: "Disposable email addresses are not accepted." }, { status: 422 })
  }

  const mxValid = await hasMxRecord(domain)
  if (!mxValid) {
    return NextResponse.json({ error: "That email domain does not appear to be valid." }, { status: 422 })
  }

  try {
    const BLOB_PATH = "jack/waitlist.json"
    const { blobs } = await list({ prefix: BLOB_PATH })

    type WaitlistEntry = { email: string; joinedAt: string; legalVersion: string }
    let waitlist: WaitlistEntry[] = []

    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      const raw = await res.json() as WaitlistEntry[]
      waitlist = Array.isArray(raw) ? raw : []
    }

    if (waitlist.some((e) => e.email === email)) {
      return NextResponse.json({ message: "You are already on the list — we will notify you when Jack v1.0 ships." })
    }

    waitlist.push({ email, joinedAt: new Date().toISOString(), legalVersion: legalVersionString() })

    await put(BLOB_PATH, JSON.stringify(waitlist), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    // Confirmation email (non-blocking)
    if (process.env.RESEND_API_KEY) {
      const resend = getResend()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev"
      resend.emails.send({
        from: "Jeroham @ js17.dev <news@js17.dev>",
        to: email,
        subject: "You are on the Jack waitlist",
        html: buildConfirmationEmail(siteUrl),
        text: `You're on the Jack waitlist.\n\nJack v1.0 is on its way to the Google Play Store. You'll get one email when it ships — no spam.\n\n— Jeroham Sanchez\nhttps://js17.dev`,
      }).catch(() => {})
    }

    return NextResponse.json({ message: "You're on the list. We'll email you when Jack v1.0 is ready." })
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
