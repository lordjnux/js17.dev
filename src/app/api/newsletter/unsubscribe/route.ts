import { NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import crypto from "crypto"
import { getResend } from "@/lib/resend"

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
    allowOverwrite: true,
  })
  return true
}

function sendGoodbyeEmail(email: string): void {
  if (!process.env.RESEND_API_KEY) return
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev"
  const from = "Jeroham @ js17.dev <news@js17.dev>"
  getResend().emails.send({
    from,
    to: email,
    subject: "You've unsubscribed from js17.dev",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Unsubscribed</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;">
    <tr><td align="center" style="padding:32px 16px 40px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:540px;width:100%;">
        <tr><td style="height:3px;border-radius:3px 3px 0 0;background:linear-gradient(90deg,#2563eb,#60a5fa);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr>
          <td style="background:#ffffff;border-radius:0 0 16px 16px;padding:36px 40px 32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
            <p style="margin:0 0 28px;font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:#2563eb;">js17.dev</p>
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;letter-spacing:-0.4px;">You've been unsubscribed.</h1>
            <p style="margin:0 0 20px;font-size:16px;color:#334155;line-height:1.75;">
              You won't receive any more emails from js17.dev. If you change your mind, you can always resubscribe at any time.
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 28px;">
              <tr>
                <td style="border-radius:8px;border:1px solid #e2e8f0;">
                  <a href="${siteUrl}/#newsletter" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 24px;color:#334155;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">Resubscribe &rarr;</a>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
              <tr><td style="height:1px;background:#f1f5f9;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#0f172a;">Jeroham Sanchez</p>
            <p style="margin:0;font-size:12px;color:#94a3b8;">Senior AI-Augmented Fullstack Engineer &mdash; <a href="${siteUrl}" style="color:#94a3b8;text-decoration:none;">js17.dev</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    text: `You've been unsubscribed from js17.dev.\n\nYou won't receive any more emails. If you change your mind: ${siteUrl}/#newsletter\n\n— Jeroham Sanchez`,
  }).catch(() => {})
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

  const removed = await removeSubscriber(email)
  if (removed) sendGoodbyeEmail(email)
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

  const removed = await removeSubscriber(email)
  if (removed) sendGoodbyeEmail(email)
  return NextResponse.json({ success: true })
}
