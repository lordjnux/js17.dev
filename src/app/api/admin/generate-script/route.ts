import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { getPostBySlug } from "@/lib/mdx"
import OpenAI from "openai"

function extractCodeBlocks(content: string): string[] {
  const blocks: string[] = []
  const regex = /```(?:\w+)?\n([\s\S]*?)```/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    const code = match[1].trim()
    if (code.length > 0) blocks.push(code)
    if (blocks.length >= 2) break
  }
  return blocks
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const { slug, videoFormat = "long" } = await req.json()
  const post = getPostBySlug(slug)
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

  const isShort = videoFormat === "short"

  const codeBlocks = extractCodeBlocks(post.content)
  const codeContext = codeBlocks.length > 0
    ? `\n\nCODE BLOCKS FROM ARTICLE (use verbatim in codeLines[] if relevant):\n${codeBlocks.map((c, i) => `--- Code Block ${i + 1} ---\n${c}`).join("\n\n")}`
    : ""

  const prompt = isShort
    ? `You are a premium YouTube Shorts producer for tech/engineering content. Create a visually-driven, high-retention 55-60 second script.

VISUAL PHILOSOPHY — THIS IS NOT A SLIDE DECK:
- Each slide shows a LARGE ICON + SHORT TITLE + icon/label CARD items (not paragraphs).
- "visual" items are displayed as cards with an emoji icon and a 3-6 word label. MAX 3 items.
- Titles: 3-5 words MAX. Think billboard, not sentence.
- The viewer SEES icons and short labels. They HEAR the narration. These are DIFFERENT.
- ALWAYS speak directly to ONE person: use "you" language ("you'll learn", "you need", "your pipeline").

SLIDE STRUCTURE (exactly 4 slides, 55-60s total):
1. type:"hook" (10-12s) — One bold claim or question that STOPS THE SCROLL. Large icon. One subtitle in visual[0].label. Start with "..." pause then the hook. Impossible to swipe away.
2. type:"insight" (14-16s) — Core insight. 3 icon+label visual items showing the KEY concepts. Fast, punchy, one core idea.
3. type:"stats" or "insight" (14-16s) — Second key point. If data-driven use "stats" type. Narration: pattern interrupt ("Here's the thing...", "But here's what nobody tells you...").
4. type:"cta" (10-12s) — Payoff + CTA. visual items: "Request a Proposal", "Subscribe for more", "Like & Share". Energetic close — "Head to js17 dot dev" + "Subscribe and hit the bell".

NARRATION RULES:
- Slide 1: Start with "..." then a HOOK — question or bold claim. Make them stay.
- Slide 2-3: Deliver value FAST. Pattern interrupts between slides.
- Slide 4: Clear, energetic CTA. Don't trail off — end strong.
- Use "..." for natural pauses at key moments.
- Sound like an expert talking to a peer, not reading a teleprompter.

Blog post title: ${post.frontmatter.title}
Blog post content:
${post.content.slice(0, 3000)}

Return ONLY valid JSON:
{
  "youtubeTitle": "string, max 60 chars, ends with #Shorts, sparks curiosity",
  "youtubeDescription": "string, 150-200 chars, punchy, 2-3 hashtags at end",
  "youtubeTags": ["8-10 relevant tags including Shorts"],
  "estimatedDuration": "number, sum of slide durations, must be 55-60",
  "slides": [
    {
      "type": "hook|insight|stats|cta|code_example",
      "icon": "single emoji representing the slide concept",
      "title": "3-5 word title",
      "visual": [{ "icon": "emoji", "label": "3-6 word label" }],
      "codeLines": ["optional, only for code_example type, max 6 lines from article code"],
      "narration": "spoken text for this slide",
      "estimatedDuration": "number in seconds"
    }
  ]
}`
    : `You are a premium YouTube content producer for tech/engineering. Create an in-depth, professional 8-12 minute educational video script. This is NOT a YouTube Shorts-style video — it is long-form content for engineers who want to learn.

FORBIDDEN:
- Punchy "Did you know?" hook style
- Pattern interrupt every slide
- Bullet-point narration
- Rushing through ideas — this is 8-12 min, give space to breathe
- Hype phrases like "absolutely mind-blowing" or "game changer"

VOICE:
- Speak directly to ONE person: "you'll see", "your system", "you can apply this"
- Sound like a senior engineer teaching a colleague — calm, confident, specific
- Long narrations (80-200 words per slide) — think essay paragraph, not bullet points

CHAPTER-BASED STRUCTURE (10-15 slides, 8-12 min total = 480-720s):

HOOK (1 slide, 15-20s):
- type:"hook" — A surprising insight or counterintuitive observation that earns attention
- NOT a YouTube hook pattern. Something genuinely interesting from the article.

CONTEXT (1 slide, 20-25s):
- type:"context" — Why this topic matters right now. Who should care. No fluff.

CHAPTER DIVIDER slides (use 2-3 of these, required):
- type:"chapter_divider" — Bold chapter title. Must have chapterNumber field.
- Narration: brief 1-2 sentence intro to the chapter ahead.
- No icon cards. Just chapterNumber and title.

DEEP DIVE slides (3-5 slides, 45-75s each):
- type:"deep_dive" — The core educational content.
- visual[] items: 2-3 items max, each with a meaningful icon and a 6-10 word descriptive label
- Narration: paragraph-style, 80-150 words, teaches something concrete

COMPARISON (optional, 1 slide, 35-50s):
- type:"comparison" — Before/after or A vs B
- Include columnA: { heading: string, items: [{icon, label}] }
- Include columnB: { heading: string, items: [{icon, label}] }

CODE EXAMPLE (optional, 1 slide, 45-60s):
- type:"code_example" — Shows real code from the article
- codeLines[]: max 8 lines of the most illustrative code from the blog post
- Narration: explains what the code does line by line

GOTCHAS (1 slide, 25-35s):
- type:"insight" — "The mistake I made early on was..."
- Real problems people encounter, first person

CONCLUSION (1 slide, 20-30s):
- type:"insight" — Callback to the HOOK. What we covered.

CTA (1 slide, 15-20s):
- type:"cta" — js17.dev, subscribe, like
- visual items: "Request a Proposal at js17.dev", "Subscribe & hit the bell", "Like & Share"

Blog post title: ${post.frontmatter.title}
Blog post content:
${post.content.slice(0, 10000)}${codeContext}

Return ONLY valid JSON:
{
  "youtubeTitle": "string, max 70 chars, power words, sparks curiosity",
  "youtubeDescription": "string, 250-300 chars, SEO-optimized, 2-3 hashtags at end",
  "youtubeTags": ["12-15 relevant tags"],
  "estimatedDuration": "number, sum of all slide durations, must be 480-720",
  "chapterTitles": [{ "slideIndex": 0, "label": "string" }],
  "slides": [
    {
      "type": "hook|context|chapter_divider|deep_dive|comparison|code_example|insight|stats|architecture|cta",
      "chapterNumber": "number, only on chapter_divider slides",
      "icon": "single emoji",
      "title": "slide title",
      "visual": [{ "icon": "emoji", "label": "6-10 word descriptive label" }],
      "columnA": { "heading": "string", "items": [{ "icon": "emoji", "label": "string" }] },
      "columnB": { "heading": "string", "items": [{ "icon": "emoji", "label": "string" }] },
      "codeLines": ["line of code", "up to 8 lines"],
      "narration": "80-200 word paragraph-style narration for this slide",
      "estimatedDuration": "number in seconds"
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
