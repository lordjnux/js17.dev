import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import type { NextRequest } from "next/server"

interface GenerateRequest {
  title: string
  description: string
  url: string
  platforms: ("x" | "linkedin-personal" | "linkedin-page")[]
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, description, url, platforms }: GenerateRequest = await req.json()

  const OpenAI = (await import("openai")).default
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const platformInstructions: Record<string, string> = {
    x: `X (Twitter): max 250 chars, punchy opener, 2-3 relevant hashtags, end with the URL. No emojis unless it feels natural.`,
    "linkedin-personal": `LinkedIn Personal: 180-280 words, 1st-person professional narrative, lead with a hook or insight from the article, 3-4 paragraphs, close with a question or CTA, 3-5 relevant hashtags at the end.`,
    "linkedin-page": `LinkedIn Company Page: 80-120 words, brand voice (professional, "we" language), highlight key value or technical insight, 2-3 hashtags.`,
  }

  const selectedInstructions = platforms
    .map((p) => platformInstructions[p])
    .filter(Boolean)
    .join("\n\n")

  const prompt = `You are a content strategist writing social media posts for a Senior Fullstack AI engineer's brand.

Article:
Title: ${title}
Description: ${description}
URL: ${url}

Generate social media copy for these platforms:
${selectedInstructions}

Return a JSON object with keys matching the platform names: "x", "linkedinPersonal", "linkedinPage".
Only include keys for the requested platforms. Return ONLY valid JSON.`

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  })

  const generated = JSON.parse(res.choices[0].message.content ?? "{}")
  return NextResponse.json(generated)
}
