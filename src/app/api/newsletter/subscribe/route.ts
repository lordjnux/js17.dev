import { NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { Resend } from "resend"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  try {
    // Load existing subscribers list from Blob
    const { blobs } = await list({ prefix: "newsletter/subscribers.json" })
    let subscribers: string[] = []

    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url)
      subscribers = await res.json()
    }

    if (subscribers.includes(email)) {
      return NextResponse.json({ message: "Already subscribed" })
    }

    subscribers.push(email)
    await put("newsletter/subscribers.json", JSON.stringify(subscribers), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    })

    // Send welcome email via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "js17.dev <hello@js17.dev>",
        to: email,
        subject: "You're subscribed to js17.dev",
        html: `<p>Thanks for subscribing to js17.dev.</p><p>You'll get notified when new articles are published.</p><p style="margin-top:24px;font-size:12px;color:#666">— Jeroham Sanchez · <a href="https://js17.dev">js17.dev</a></p>`,
      })
    }

    return NextResponse.json({ message: "Subscribed" })
  } catch {
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 })
  }
}
