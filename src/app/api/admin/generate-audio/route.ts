import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, ADMIN_EMAIL } from "@/lib/auth"
import { put } from "@vercel/blob"
import OpenAI from "openai"

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const session = await getServerSession(authOptions)
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { narration } = await req.json()
  if (!narration) return NextResponse.json({ error: "Missing narration" }, { status: 400 })

  // Generate TTS with OpenAI — onyx: deep, natural male voice
  const mp3 = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: "onyx",
    input: narration,
    speed: 0.95,
  })

  const buffer = Buffer.from(await mp3.arrayBuffer())

  // Upload to Vercel Blob (temporary, public)
  const blob = await put(`audio/narration-${Date.now()}.mp3`, buffer, {
    access: "public",
    contentType: "audio/mpeg",
  })

  return NextResponse.json({ url: blob.url })
}
