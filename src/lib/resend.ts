import { Resend } from "resend"
import { ProposalData } from "./validations"

// Lazy instantiation to avoid build-time errors when key is not set
let _resend: Resend | null = null
export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "placeholder")
  }
  return _resend
}
export const resend = { emails: { send: (...args: Parameters<Resend["emails"]["send"]>) => getResend().emails.send(...args) } }

export function buildProposalEmailHtml(data: ProposalData): string {
  const { client, project, budget, contact } = data
  const currencies = budget.currencies?.join(" / ") || ""
  const parts = []
  if (budget.hourlyRate) parts.push(`${currencies} ${budget.hourlyRate}/hr`)
  if (budget.fixedBudget) parts.push(`Fixed: ${currencies} ${budget.fixedBudget}`)
  const budgetDisplay = parts.join(" · ") || "TBD"

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Project Proposal</title></head>
<body style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a;">
  <div style="border-top: 4px solid #3b82f6; padding-top: 24px;">
    <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px;">New Project Proposal</h1>
    <p style="color: #64748b; margin: 0 0 32px;">From js17.dev contact form</p>

    <h2 style="font-size: 16px; font-weight: 600; color: #3b82f6; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Client</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Name</td><td style="padding: 6px 0; font-weight: 500;">${client.name}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Company</td><td style="padding: 6px 0; font-weight: 500;">${client.company}</td></tr>
      ${client.website ? `<tr><td style="padding: 6px 0; color: #64748b;">Website</td><td style="padding: 6px 0;"><a href="${client.website}" style="color: #3b82f6;">${client.website}</a></td></tr>` : ""}
    </table>

    <h2 style="font-size: 16px; font-weight: 600; color: #3b82f6; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Project</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Title</td><td style="padding: 6px 0; font-weight: 500;">${project.title}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Type</td><td style="padding: 6px 0;">${project.type}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Timeline</td><td style="padding: 6px 0;">${project.timeline}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b; vertical-align: top;">Description</td><td style="padding: 6px 0;">${project.description}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b; vertical-align: top;">Features</td><td style="padding: 6px 0;">${project.features.join(", ")}</td></tr>
    </table>

    <h2 style="font-size: 16px; font-weight: 600; color: #3b82f6; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Budget</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Currency</td><td style="padding: 6px 0; font-weight: 500;">${currencies}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Details</td><td style="padding: 6px 0;">${budgetDisplay}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Flexibility</td><td style="padding: 6px 0; text-transform: capitalize;">${budget.flexibility}</td></tr>
    </table>

    <h2 style="font-size: 16px; font-weight: 600; color: #3b82f6; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Contact</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Email</td><td style="padding: 6px 0;"><a href="mailto:${contact.email}" style="color: #3b82f6;">${contact.email}</a></td></tr>
      ${contact.phone ? `<tr><td style="padding: 6px 0; color: #64748b;">Phone</td><td style="padding: 6px 0;">${contact.phone}</td></tr>` : ""}
      <tr><td style="padding: 6px 0; color: #64748b;">Timezone</td><td style="padding: 6px 0;">${contact.timezone}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Preferred</td><td style="padding: 6px 0; text-transform: capitalize;">${contact.preferredContact}</td></tr>
      ${contact.additionalNotes ? `<tr><td style="padding: 6px 0; color: #64748b; vertical-align: top;">Notes</td><td style="padding: 6px 0;">${contact.additionalNotes}</td></tr>` : ""}
    </table>

    <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px;">
      Sent from js17.dev proposal form · ${new Date().toLocaleString()}
    </p>
  </div>
</body>
</html>`
}

export function buildClientConfirmationHtml(data: ProposalData): string {
  const { client, project } = data
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Proposal Received — js17.dev</title></head>
<body style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a;">
  <div style="border-top: 4px solid #3b82f6; padding-top: 24px;">
    <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px;">Got it, ${client.name}! 🎯</h1>
    <p style="color: #64748b; margin: 0 0 24px; line-height: 1.6;">
      I've received your proposal for <strong>${project.title}</strong>.
      I typically review and respond within 24 hours on business days.
    </p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #475569;">What happens next:</h3>
      <ol style="margin: 0; padding-left: 20px; color: #64748b; line-height: 2;">
        <li>I'll review your project details</li>
        <li>I'll prepare a tailored proposal or ask follow-up questions</li>
        <li>We'll schedule a discovery call if needed</li>
        <li>Kick off when you're ready</li>
      </ol>
    </div>

    <p style="line-height: 1.6;">
      In the meantime, feel free to check out my
      <a href="https://js17.dev/blog" style="color: #3b82f6;">blog</a>
      or connect on
      <a href="https://linkedin.com/in/jeroham-sanchez" style="color: #3b82f6;">LinkedIn</a>.
    </p>

    <p style="margin-top: 32px;">
      Best,<br>
      <strong>Jeroham Sanchez</strong><br>
      <a href="https://js17.dev" style="color: #3b82f6;">js17.dev</a>
    </p>

    <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px;">
      You received this because you submitted a proposal at js17.dev.
    </p>
  </div>
</body>
</html>`
}
