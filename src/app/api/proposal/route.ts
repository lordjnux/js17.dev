import { NextRequest, NextResponse } from "next/server"
import { proposalSchema } from "@/lib/validations"
import { resend, buildProposalEmailHtml, buildClientConfirmationHtml } from "@/lib/resend"
import { moderateContent, recordSubmission } from "@/lib/moderation"

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

  // Build text for moderation: combine all free-text fields
  const textToModerate = [
    data.client.name,
    data.client.company,
    data.project.title,
    data.project.description,
    data.project.features.join(" "),
    data.contact.additionalNotes || "",
  ].join(" ")

  const modResult = await moderateContent(textToModerate)

  const submissionId = crypto.randomUUID()
  const excerpt = textToModerate.slice(0, 120).replace(/\s+/g, " ").trim()

  if (modResult.flagged) {
    // Record blocked submission for observability (non-blocking)
    recordSubmission({
      id: submissionId,
      timestamp: new Date().toISOString(),
      flagged: true,
      action: "blocked",
      reason: modResult.reason,
      categories: modResult.categories,
      scores: modResult.scores,
      source: modResult.source,
      excerpt,
      clientName: data.client.name,
      company: data.client.company,
      projectTitle: data.project.title,
      contactEmail: data.contact.email,
    }).catch(() => {})

    // Return success to client — don't reveal moderation decision
    return NextResponse.json({ success: true })
  }

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

    // Record sent submission for observability (non-blocking)
    recordSubmission({
      id: submissionId,
      timestamp: new Date().toISOString(),
      flagged: false,
      action: "sent",
      reason: null,
      categories: modResult.categories,
      scores: modResult.scores,
      source: modResult.source,
      excerpt,
      clientName: data.client.name,
      company: data.client.company,
      projectTitle: data.project.title,
      contactEmail: data.contact.email,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 })
  }
}
