import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, ADMIN_EMAIL } from "@/lib/auth"
import { getPostBySlug } from "@/lib/mdx"
import OpenAI from "openai"

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const session = await getServerSession(authOptions)
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await req.json()
  const post = getPostBySlug(slug)
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

  const prompt = `You are an expert YouTube content creator specializing in tech/engineering content. Convert the following blog post into a viral YouTube video script structured as slides.

Requirements:
- youtubeTitle: Compelling, max 70 chars, includes power words, sparks curiosity
- youtubeDescription: SEO-optimized, 250-300 chars, includes 2-3 relevant hashtags at the end
- youtubeTags: 12-15 relevant tags as array
- slides: 8-12 slides total
  - First slide: Strong hook that makes viewers want to stay
  - Each slide: title (5-8 words, punchy), bullets (3-4 concise points), narration (natural spoken English, 25-45 seconds each)
  - Last slide: Clear CTA — visit js17.dev and request a proposal
  - Narration must sound like a real person talking, energetic but not fake
- estimatedDuration: total seconds (sum of all slide durations)

Blog post title: ${post.frontmatter.title}
Blog post content:
${post.content.slice(0, 6000)}

Return ONLY valid JSON, no markdown:
{
  "youtubeTitle": string,
  "youtubeDescription": string,
  "youtubeTags": string[],
  "estimatedDuration": number,
  "slides": [
    {
      "title": string,
      "bullets": string[],
      "narration": string,
      "estimatedDuration": number
    }
  ]
}`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  })

  try {
    const script = JSON.parse(completion.choices[0].message.content || "{}")
    return NextResponse.json(script)
  } catch {
    return NextResponse.json({ error: "GPT-4o returned invalid JSON" }, { status: 500 })
  }
}
