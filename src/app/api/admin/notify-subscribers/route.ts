import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { getPostBySlug } from "@/lib/mdx"
import { put, list } from "@vercel/blob"
import { getResend } from "@/lib/resend"
import { Post } from "@/types/blog"
import crypto from "crypto"
import OpenAI from "openai"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev"

function generateToken(email: string): string {
  return crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET || "fallback")
    .update(email)
    .digest("base64url")
}

async function generateSynopsis(post: Post): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `You are writing a newsletter announcement for a software engineering blog.

Article title: "${post.frontmatter.title}"
Article description: "${post.frontmatter.description}"
Article tags: ${post.frontmatter.tags.join(", ")}

Write a compelling 3-sentence newsletter synopsis that:
1. Opens with a DIFFERENT angle than the description — an intriguing question, a surprising insight, or a concrete "what you'll gain" hook
2. Highlights ONE unexpected or counterintuitive takeaway from the article
3. Ends with a clear forward-looking statement about why this matters

Rules: Do NOT repeat the description verbatim. First person from the author. Conversational but professional. Max 3 sentences. No markdown.`,
      },
    ],
    max_tokens: 220,
    temperature: 0.85,
  })

  return completion.choices[0]?.message?.content?.trim() || post.frontmatter.description
}

function buildEmailHtml(post: Post, synopsis: string, email: string, token: string): string {
  const postUrl = `${SITE_URL}/blog/${post.slug}`
  const unsubUrl = `${SITE_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
  const date = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(post.frontmatter.date)).toUpperCase()
  const tags = post.frontmatter.tags.slice(0, 4)
  const readingTime = post.frontmatter.readingTime || 8
  const preheader = synopsis.slice(0, 110).replace(/"/g, "&quot;")
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${post.frontmatter.title.replace(/</g, "&lt;")}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background-color: #f7f6f3; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f7f6f3;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f7f6f3;white-space:nowrap;">${preheader} — js17.dev</div>
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;">&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f7f6f3;min-width:320px;">
    <tr>
      <td align="center" style="padding:32px 16px 44px;">

        <!-- Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;">

          <!-- Masthead top rule -->
          <tr>
            <td style="height:4px;background:#0f172a;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px 32px;border:1px solid #e5e3dc;border-top:none;border-radius:0 0 3px 3px;">

              <!-- Masthead row: brand + badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td valign="middle">
                    <span style="font-family:'Courier New',Courier,monospace;font-size:17px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;">js17.dev</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;border:1px solid #cbd5e1;padding:3px 9px;border-radius:2px;">New Article</span>
                  </td>
                </tr>
              </table>

              <!-- Full-width rule under masthead -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr><td style="height:1px;background:#0f172a;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- Meta: date + reading time -->
              <p style="margin:0 0 14px;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:0.14em;text-transform:uppercase;">${date}&nbsp;&nbsp;&middot;&nbsp;&nbsp;${readingTime} MIN READ</p>

              <!-- Headline -->
              <h1 style="margin:0 0 18px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.22;letter-spacing:-0.5px;">${post.frontmatter.title.replace(/</g, "&lt;")}</h1>

              <!-- Tags -->
              <div style="margin-bottom:22px;">
                ${tags.map((t) => `<span style="display:inline-block;border:1px solid #d1d5db;color:#374151;font-size:11px;font-weight:500;padding:2px 9px;border-radius:2px;margin:0 4px 4px 0;background:#ffffff;letter-spacing:0.01em;">${t}</span>`).join("")}
              </div>

              <!-- Section rule -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;">
                <tr><td style="height:1px;background:#e5e3dc;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- AI-generated synopsis -->
              <p style="margin:0 0 28px;font-size:16px;color:#374151;line-height:1.82;">${synopsis.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>

              <!-- CTA button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#0f172a;border-radius:3px;">
                    <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${postUrl}" style="height:46px;v-text-anchor:middle;width:210px;" arcsize="5%" strokecolor="#0f172a" fillcolor="#0f172a"><w:anchorlock/><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">Read the Full Article →</center></v:roundrect><![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${postUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.03em;border-radius:3px;line-height:1;">Read the Full Article &rarr;</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Section rule -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;">
                <tr><td style="height:1px;background:#e5e3dc;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- Author byline -->
              <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#0f172a;">Jeroham Sanchez</p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">Senior AI-Augmented Fullstack Engineer &mdash; <a href="${SITE_URL}" style="color:#94a3b8;text-decoration:none;">js17.dev</a></p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 8px 4px;text-align:center;">
              <p style="margin:0 0 5px;font-size:11px;color:#94a3b8;line-height:1.65;">
                You're receiving this because you subscribed to <strong style="color:#64748b;">js17.dev</strong>.<br>
                <a href="${unsubUrl}" style="color:#94a3b8;text-decoration:underline;text-underline-offset:2px;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="${postUrl}" style="color:#94a3b8;text-decoration:underline;text-underline-offset:2px;">View online</a>
              </p>
              <p style="margin:0;font-size:10px;color:#cbd5e1;">&copy; ${year} js17.dev &mdash; All rights reserved</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

function buildPlainText(post: Post, synopsis: string, email: string, token: string): string {
  const postUrl = `${SITE_URL}/blog/${post.slug}`
  const unsubUrl = `${SITE_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
  const date = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(post.frontmatter.date)
  )

  return `${post.frontmatter.title}
${"─".repeat(Math.min(post.frontmatter.title.length, 60))}

${date} · ${post.frontmatter.readingTime || 8} min read
Tags: ${post.frontmatter.tags.slice(0, 4).join(", ")}

${synopsis}

Read the full article:
${postUrl}

──────────────────────────────────────
You're receiving this because you subscribed to js17.dev updates.
Unsubscribe: ${unsubUrl}

© ${new Date().getFullYear()} js17.dev · Jeroham Sanchez`
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await req.json().catch(() => ({}))
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug required" }, { status: 400 })
  }

  const post = getPostBySlug(slug)
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

  // Prevent double-send
  const { blobs: sentBlobs } = await list({ prefix: "newsletter/sent-posts.json" })
  let sentPosts: string[] = []
  if (sentBlobs.length > 0) {
    const res = await fetch(sentBlobs[0].url, { cache: "no-store" })
    sentPosts = await res.json().catch(() => [])
  }
  if (sentPosts.includes(slug)) {
    return NextResponse.json({ error: "Newsletter already sent for this post" }, { status: 409 })
  }

  // Load subscribers
  const { blobs } = await list({ prefix: "newsletter/subscribers.json" })
  type Subscriber = { email: string }
  let subscribers: Subscriber[] = []
  if (blobs.length > 0) {
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    const raw = await res.json().catch(() => [])
    subscribers = Array.isArray(raw)
      ? raw.map((r) => (typeof r === "string" ? { email: r } : r)).filter((r) => !!r.email)
      : []
  }
  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No active subscribers" }, { status: 400 })
  }

  // Generate AI synopsis
  const synopsis = await generateSynopsis(post)

  // Send in batches of 10
  const resend = getResend()
  const from = "Jeroham @ js17.dev <news@js17.dev>"
  const BATCH = 10
  let sent = 0
  let failed = 0

  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH)
    const emails = batch.map(({ email }) => {
      const token = generateToken(email)
      const unsubUrl = `${SITE_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
      return {
        from,
        to: email,
        subject: `New article: ${post.frontmatter.title}`,
        html: buildEmailHtml(post, synopsis, email, token),
        text: buildPlainText(post, synopsis, email, token),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>, <mailto:legal@js17.dev?subject=Unsubscribe%20${encodeURIComponent(email)}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "X-Entity-Ref-ID": `${slug}-${Buffer.from(email).toString("base64").slice(0, 8)}`,
        },
      }
    })

    try {
      await resend.batch.send(emails)
      sent += batch.length
    } catch {
      failed += batch.length
    }

    if (i + BATCH < subscribers.length) {
      await new Promise((r) => setTimeout(r, 300))
    }
  }

  // Mark as sent
  sentPosts.push(slug)
  await put("newsletter/sent-posts.json", JSON.stringify(sentPosts), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  return NextResponse.json({ sent, failed, total: subscribers.length, synopsis })
}
