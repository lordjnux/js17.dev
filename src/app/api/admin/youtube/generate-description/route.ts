import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { getPostBySlug } from "@/lib/mdx"
import OpenAI from "openai"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev"

const SOCIAL_SECTION = `\
💻 CONNECT WITH ME
GitHub      → https://github.com/lordjnux
LinkedIn    → https://linkedin.com/in/jeroham-sanchez
YouTube     → https://www.youtube.com/@jerohamsanchezb
Twitch      → https://www.twitch.tv/jerohamsanchez`

const SUPPORTERS_SECTION = `\
❤️ SUPPORT THIS CHANNEL
☕ Buy Me a Coffee  → https://buymeacoffee.com/jerohamsanchez
📺 Subscribe        → https://www.youtube.com/@jerohamsanchezb
🎮 Live on Twitch   → https://www.twitch.tv/jerohamsanchez
📖 Borrador de Poemas → https://www.autoreseditores.com/libro/13344/jeroham-david-sanchez-bermudez/borrador-de-poemas.html`

const DIVIDER = "━".repeat(42)

interface SlideForChapters {
  title: string
  estimatedDuration: number
}

function buildChapters(slides: SlideForChapters[]): string {
  const lines: string[] = ["📌 CHAPTERS"]
  let elapsed = 0
  slides.forEach((slide, i) => {
    const mins = Math.floor(elapsed / 60)
    const secs = Math.floor(elapsed % 60)
    const ts = `${mins}:${secs.toString().padStart(2, "0")}`
    lines.push(`${ts} ${i === 0 ? "Introduction" : slide.title}`)
    elapsed += slide.estimatedDuration
  })
  return lines.join("\n")
}

function buildChaptersFromMarkers(
  slides: SlideForChapters[],
  chapterTitles: Array<{ slideIndex: number; label: string }>
): string {
  // Build cumulative timestamp map
  const cumulativeTimes: number[] = [0]
  for (let i = 0; i < slides.length; i++) {
    cumulativeTimes.push(cumulativeTimes[i] + (slides[i]?.estimatedDuration ?? 0))
  }

  const lines: string[] = ["📌 CHAPTERS", "0:00 Introduction"]

  for (const marker of chapterTitles) {
    const elapsed = cumulativeTimes[marker.slideIndex] ?? 0
    if (elapsed === 0) continue // Already covered by Introduction
    const mins = Math.floor(elapsed / 60)
    const secs = Math.floor(elapsed % 60)
    const ts = `${mins}:${secs.toString().padStart(2, "0")}`
    lines.push(`${ts} ${marker.label}`)
  }

  return lines.join("\n")
}

function buildHashtags(tags: string[]): string {
  const base = ["#JavaScript", "#AIEngineering", "#Fullstack", "#WebDevelopment", "#SoftwareEngineering"]
  const fromTags = tags.slice(0, 6).map((t) => `#${t.replace(/\s+/g, "")}`)
  const combined = Array.from(new Set([...fromTags, ...base])).slice(0, 10)
  return combined.join(" ")
}

async function generateSynopsis(
  videoType: string,
  title: string,
  description: string,
  tags: string[]
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return description

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const brandStory =
    videoType === "logo-short" || videoType === "logo-long"
      ? `js17.dev brand story: "js" = Jeroham Sanchez initials + tribute to JavaScript and the fullstack. "17" = special number present across mathematics, esoterics, religion, philosophy, and the arts. ".dev" = highest level of programming craft, pushing AI to its extreme potential. Brand concept: command center, expansion, minimalism, calm, effective, awareness.`
      : null

  const prompt = brandStory
    ? `You are writing a YouTube video description for a brand story video.

${brandStory}

Write a compelling 2-3 sentence opening for the YouTube description. Be calm, professional, intriguing. First person from the creator. No markdown, no hashtags.`
    : `You are writing a YouTube video description for a software engineering video.

Video title: "${title}"
Article description: "${description}"
Tags: ${tags.join(", ")}

Write a compelling 2-3 sentence opening for the YouTube description. Calm, professional, informative. First person from the creator. No markdown, no hashtags.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 160,
    temperature: 0.75,
  })

  return completion.choices[0]?.message?.content?.trim() || description
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const {
    videoType = "article",
    slug,
    slides = [],
    youtubeTitle = "",
    youtubeTags = [],
    chapterTitles,
  } = body as {
    videoType?: "article" | "logo-short" | "logo-long"
    slug?: string
    slides?: SlideForChapters[]
    youtubeTitle?: string
    youtubeTags?: string[]
    chapterTitles?: Array<{ slideIndex: number; label: string }>
  }

  let synopsis = ""
  let postUrl: string | null = null

  if (videoType === "article" && slug) {
    const post = getPostBySlug(slug)
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })
    synopsis = await generateSynopsis(videoType, post.frontmatter.title, post.frontmatter.description, youtubeTags)
    postUrl = `${SITE_URL}/blog/${slug}`
  } else {
    synopsis = await generateSynopsis(videoType, youtubeTitle, "", youtubeTags)
  }

  const parts: string[] = [synopsis]

  // Chapters (only for article videos with multiple slides)
  if (videoType === "article" && slides.length > 1) {
    parts.push("")
    parts.push(
      chapterTitles && chapterTitles.length > 0
        ? buildChaptersFromMarkers(slides, chapterTitles)
        : buildChapters(slides)
    )
  }

  // Article link
  if (postUrl) {
    parts.push("")
    parts.push(`🔗 READ THE FULL ARTICLE\n${postUrl}`)
  }

  parts.push("")
  parts.push(DIVIDER)
  parts.push("")
  parts.push(SOCIAL_SECTION)
  parts.push("")
  parts.push(DIVIDER)
  parts.push("")
  parts.push(SUPPORTERS_SECTION)
  parts.push("")
  parts.push(DIVIDER)
  parts.push("")
  parts.push(buildHashtags(youtubeTags))

  const description = parts.join("\n")

  return NextResponse.json({ description })
}
