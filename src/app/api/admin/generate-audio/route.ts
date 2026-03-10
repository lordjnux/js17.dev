import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { put } from "@vercel/blob"
import OpenAI from "openai"

export const maxDuration = 60

const ELEVENLABS_VOICES = {
  short: "21m00Tcm4TlvDq8ikWAM", // Rachel — warm, engaging
  long: "pNInz6obpgDQGcFmaJgB",   // Adam — deep, authoritative
}

function estimateMp3Duration(buffer: Buffer, provider: "elevenlabs" | "openai"): number {
  // Try to parse first valid MP3 frame header for bitrate-based estimation
  for (let i = 0; i < Math.min(buffer.length - 4, 10240); i++) {
    const b0 = buffer[i]
    const b1 = buffer[i + 1]
    // MP3 sync word: 0xFF followed by 0xE0 or higher in next byte
    if (b0 === 0xFF && (b1 & 0xE0) === 0xE0) {
      const layerBits = (b1 >> 1) & 0x03
      const versionBits = (b1 >> 3) & 0x03
      if (layerBits === 0x01 && versionBits !== 0x01) { // MPEG Layer 3
        const b2 = buffer[i + 2]
        const bitrateBits = (b2 >> 4) & 0x0F
        // MPEG1 Layer3 bitrate table (kbps)
        const bitrateTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
        const bitrateKbps = bitrateTable[bitrateBits]
        if (bitrateKbps > 0) {
          return (buffer.length * 8) / (bitrateKbps * 1000)
        }
      }
      break
    }
  }
  // Fallback: ElevenLabs ~128kbps, OpenAI TTS-HD ~192kbps
  return provider === "elevenlabs" ? buffer.length / 16000 : buffer.length / 24000
}

async function generateWithElevenLabs(narration: string, voiceId: string, isShort: boolean): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text: narration,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: isShort ? 0.65 : 0.72,
        similarity_boost: 0.75,
        style: isShort ? 0.45 : 0.30,
        use_speaker_boost: true,
      },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ElevenLabs ${res.status}: ${err}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function generateWithOpenAI(narration: string, isShort: boolean): Promise<Buffer> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const speed = isShort ? 1.05 : 0.92
  const mp3 = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: "onyx",
    input: narration,
    speed,
  })
  return Buffer.from(await mp3.arrayBuffer())
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  // Backward compat: old contract had a single narration string
  if (!Array.isArray(body.slides)) {
    const { narration, videoFormat = "long" } = body
    if (!narration) return NextResponse.json({ error: "Missing narration" }, { status: 400 })
    const isShort = videoFormat === "short"
    const buffer = await generateWithOpenAI(narration, isShort)
    const blob = await put(`audio/narration-${Date.now()}.mp3`, buffer, {
      access: "public",
      contentType: "audio/mpeg",
      allowOverwrite: true,
    })
    return NextResponse.json({ url: blob.url })
  }

  // New contract: per-slide array
  const { slides, videoFormat = "long" } = body as {
    slides: Array<{ narration: string; slideIndex: number }>
    videoFormat: "short" | "long"
  }

  const isShort = videoFormat === "short"
  const useElevenLabs = !!process.env.ELEVENLABS_API_KEY
  const voiceId = isShort ? ELEVENLABS_VOICES.short : ELEVENLABS_VOICES.long
  const batchId = Date.now().toString()

  const results = await Promise.all(
    slides.map(async (slide) => {
      let buffer: Buffer
      let provider: "elevenlabs" | "openai" = "openai"

      if (useElevenLabs) {
        try {
          buffer = await generateWithElevenLabs(slide.narration, voiceId, isShort)
          provider = "elevenlabs"
        } catch (err) {
          console.warn(`ElevenLabs fallback for slide ${slide.slideIndex}:`, err instanceof Error ? err.message : err)
          buffer = await generateWithOpenAI(slide.narration, isShort)
        }
      } else {
        buffer = await generateWithOpenAI(slide.narration, isShort)
      }

      const durationSeconds = estimateMp3Duration(buffer, provider)
      const blob = await put(
        `audio/slide-${batchId}-${slide.slideIndex}-${Date.now()}.mp3`,
        buffer,
        { access: "public", contentType: "audio/mpeg", allowOverwrite: true }
      )
      return { slideIndex: slide.slideIndex, url: blob.url, durationSeconds }
    })
  )

  const audioSlides = results.sort((a, b) => a.slideIndex - b.slideIndex)
  const totalDuration = audioSlides.reduce((sum, s) => sum + s.durationSeconds, 0)

  return NextResponse.json({ audioSlides, totalDuration })
}
