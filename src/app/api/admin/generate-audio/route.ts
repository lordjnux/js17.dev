import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { put } from "@vercel/blob"
import OpenAI from "openai"

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const { narration, videoFormat = "long" } = await req.json()
  if (!narration) return NextResponse.json({ error: "Missing narration" }, { status: 400 })

  // Shorts: slightly faster and punchier; Long: authoritative, natural
  const speed = videoFormat === "short" ? 1.05 : 0.92

  const mp3 = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: "onyx",
    input: narration,
    speed,
  })

  const buffer = Buffer.from(await mp3.arrayBuffer())

  const blob = await put(`audio/narration-${Date.now()}.mp3`, buffer, {
    access: "public",
    contentType: "audio/mpeg",
    allowOverwrite: true,
  })

  return NextResponse.json({ url: blob.url })
}
