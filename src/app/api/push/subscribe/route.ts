import { NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

export async function POST(req: NextRequest) {
  const subscription = await req.json()
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 })
  }

  try {
    const { blobs } = await list({ prefix: "push/subscriptions.json" })
    let subscriptions: PushSubscriptionJSON[] = []

    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url)
      subscriptions = await res.json()
    }

    const exists = subscriptions.some((s) => s.endpoint === subscription.endpoint)
    if (!exists) {
      subscriptions.push(subscription)
      await put("push/subscriptions.json", JSON.stringify(subscriptions), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
      })
    }

    return NextResponse.json({ message: "Subscribed" })
  } catch {
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json()
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 })

  try {
    const { blobs } = await list({ prefix: "push/subscriptions.json" })
    if (blobs.length === 0) return NextResponse.json({ message: "Not found" })

    const res = await fetch(blobs[0].url)
    const subscriptions: PushSubscriptionJSON[] = await res.json()
    const filtered = subscriptions.filter((s) => s.endpoint !== endpoint)

    await put("push/subscriptions.json", JSON.stringify(filtered), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    })

    return NextResponse.json({ message: "Unsubscribed" })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
