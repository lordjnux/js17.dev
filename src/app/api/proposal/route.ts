import { NextRequest, NextResponse } from "next/server"
import { proposalSchema } from "@/lib/validations"
import { resend, buildProposalEmailHtml, buildClientConfirmationHtml } from "@/lib/resend"

// Simple in-memory rate limiting (per IP, per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (record.count >= 3) return false
  record.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = proposalSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 422 })
  }

  const data = result.data

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "proposals@js17.dev"
    const toEmail = process.env.RESEND_TO_EMAIL || "jeroham@js17.dev"

    await Promise.all([
      // Email to Jeroham
      resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `New Proposal: ${data.project.title} — ${data.client.company}`,
        html: buildProposalEmailHtml(data),
        replyTo: data.contact.email,
      }),
      // Confirmation email to client
      resend.emails.send({
        from: fromEmail,
        to: data.contact.email,
        subject: "Got your proposal — I'll be in touch soon",
        html: buildClientConfirmationHtml(data),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 })
  }
}
