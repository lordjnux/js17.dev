import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"
import { getPostBySlug } from "@/lib/mdx"
import OpenAI from "openai"

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const { slug, videoFormat = "long" } = await req.json()
  const post = getPostBySlug(slug)
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

  const isShort = videoFormat === "short"

  const prompt = isShort
    ? `You are a premium YouTube Shorts producer for tech/engineering content. Create a visually-driven, high-retention 55-60 second script.

VISUAL PHILOSOPHY — THIS IS NOT A SLIDE DECK:
- Each slide shows a LARGE ICON + SHORT TITLE + icon/label CARD items (not paragraphs).
- "visual" items are displayed as cards with an emoji icon and a 3-6 word label. MAX 3 items.
- Titles: 3-5 words MAX. Think billboard, not sentence.
- The viewer SEES icons and short labels. They HEAR the narration. These are DIFFERENT.

SLIDE STRUCTURE (exactly 4 slides, 55-60s total):
1. type:"hook" (10-12s) — One bold claim or question that STOPS THE SCROLL. Large icon. One subtitle line in visual[0].label. Narration: open with "..." pause then the hook. Make it impossible to swipe away.
2. type:"insight" (14-16s) — Core insight. 3 icon+label visual items showing the KEY concepts. Narration: fast, punchy, one core idea.
3. type:"stats" or "insight" (14-16s) — Second key point. If data-driven, use "stats" type with number+label items. Narration: pattern interrupt ("Here's the thing...", "But here's what nobody tells you...").
4. type:"cta" (10-12s) — Payoff + CTA. visual items: "Request a Proposal", "Subscribe for more", "Like & Share". Narration: energetic close — "Head to js17 dot dev" + "Subscribe and hit the bell".

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
      "type": "hook|insight|stats|cta",
      "icon": "single emoji representing the slide concept",
      "title": "3-5 word title",
      "visual": [{ "icon": "emoji", "label": "3-6 word label" }],
      "narration": "spoken text for this slide",
      "estimatedDuration": "number in seconds"
    }
  ]
}`
    : `You are a premium YouTube content producer for tech/engineering. Create a visually-driven, high-retention 6-10 minute video script.

VISUAL PHILOSOPHY — THIS IS NOT A SLIDE DECK:
- Each slide shows a LARGE ICON + SHORT TITLE + icon/label CARD items. NOT paragraphs.
- "visual" items are displayed as cards: emoji icon + 4-7 word label. MAX 4-5 items per slide.
- Titles: 4-7 words. Think headline, not sentence.
- The viewer SEES icons and labels. They HEAR the narration. These serve DIFFERENT purposes.
- Choose icons that genuinely represent the concept (not random decoration).

INTRO > CORE > OUTRO STRUCTURE:

INTRO (slides 1-2, ~30-40s total):
- Slide 1 type:"hook" (10-15s): Bold claim or question. Large icon. One subtitle. The viewer decides to stay or leave in the first 8 seconds. Make this count.
- Slide 2 type:"intro" (15-20s): What this video covers. Set expectations. "By the end of this video, you'll know..." visual items preview the 3-4 key topics.

CORE (slides 3 to N-2, the meat — this is why they stayed):
- type:"insight" for conceptual slides: icon+label visual items showing key concepts.
- type:"stats" for data/numbers slides: icon+label items where labels include numbers ("$36/mo total cost", "3h 58m build time").
- type:"architecture" for system/tech slides: icon+label items representing components/services.
- ONE clear idea per slide. If you need to cover two ideas, use two slides.
- Every 2-3 slides, include a pattern interrupt in narration: "Now here's where it gets interesting...", "But wait, there's more...", "This is the part most people get wrong..."

OUTRO (last 2 slides):
- Second-to-last type:"insight": The ONE key takeaway. If they remember nothing else, remember THIS.
- Last slide type:"cta": CTA items — "Request a Proposal at js17.dev", "Subscribe & hit the bell", "Like & Share". Narration: energetic, clear, no mumbling the ending.

NARRATION RULES:
- First 10 seconds: HOOK. Bold, confident, specific. Not generic.
- Between slides: Natural transitions. "So...", "Now...", "Here's the thing..."
- Include "..." for pauses at key moments and between sections.
- Vary rhythm: short punchy sentences, then a longer explanatory one.
- Middle content: MAXIMUM VALUE. Specific numbers, specific tools, specific insights.
- Last 20 seconds: Energetic CTA. "Head to js17 dot dev and request a proposal. If you got value from this, subscribe and hit the bell. I'll see you in the next one."
- Sound like a senior engineer explaining to a colleague, not a YouTuber performing.

Blog post title: ${post.frontmatter.title}
Blog post content:
${post.content.slice(0, 6000)}

Return ONLY valid JSON:
{
  "youtubeTitle": "string, max 70 chars, power words, sparks curiosity",
  "youtubeDescription": "string, 250-300 chars, SEO-optimized, 2-3 hashtags at end",
  "youtubeTags": ["12-15 relevant tags"],
  "estimatedDuration": "number, sum of all slide durations",
  "slides": [
    {
      "type": "hook|intro|insight|stats|architecture|cta",
      "icon": "single emoji representing the slide concept",
      "title": "4-7 word title",
      "visual": [{ "icon": "emoji", "label": "4-7 word label" }],
      "narration": "spoken text for this slide, natural and engaging",
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
