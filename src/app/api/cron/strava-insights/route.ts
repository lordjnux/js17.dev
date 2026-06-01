import { NextResponse } from "next/server"
import { list, put } from "@vercel/blob"
import type { StravaStats, StravaAIInsights } from "@/types/strava"

const INSIGHTS_CACHE = "strava/ai-insights.json"

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Load cached Strava stats
    const { blobs } = await list({ prefix: "strava/stats-cache.json" })
    if (blobs.length === 0) {
      return NextResponse.json({ error: "No Strava stats cache found" }, { status: 404 })
    }
    const statsRes = await fetch(blobs[0].url, { cache: "no-store" })
    if (!statsRes.ok) throw new Error("Failed to fetch Strava stats cache")
    const stats: StravaStats = await statsRes.json()

    const insights = await generateInsights(stats)

    await put(INSIGHTS_CACHE, JSON.stringify(insights), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    return NextResponse.json({ ok: true, generatedAt: insights.generatedAt })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

async function generateInsights(stats: StravaStats): Promise<StravaAIInsights> {
  const OpenAI = (await import("openai")).default
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const activities = stats.recentActivities.slice(0, 30)

  const activitySummary = activities.map((a) => ({
    type: a.sport_type || a.type,
    date: a.start_date_local.substring(0, 10),
    distanceKm: (a.distance / 1000).toFixed(2),
    durationMin: Math.round(a.moving_time / 60),
    paceMinKm: a.average_speed > 0
      ? `${Math.floor(1000 / a.average_speed / 60)}:${String(Math.round(1000 / a.average_speed % 60)).padStart(2, "0")}`
      : null,
    avgHR: a.average_heartrate ?? null,
    maxHR: a.max_heartrate ?? null,
    cadence: a.average_cadence ?? null,
    calories: a.calories ?? null,
    relativeEffort: a.suffer_score ?? null,
  }))

  const prompt = `You are a sports performance coach analyzing an athlete's recent training data.

Here are their last ${activitySummary.length} activities:
${JSON.stringify(activitySummary, null, 2)}

Analyze the data and return a JSON object with EXACTLY this structure:
{
  "summary": "2-3 sentence overview of their training pattern and overall fitness trend",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "weeklyTrend": "improving" | "consistent" | "declining"
}

Be specific, data-driven, and actionable. Reference actual numbers from the data.
Return ONLY valid JSON, no markdown.`

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  })

  const parsed = JSON.parse(res.choices[0].message.content ?? "{}")

  return {
    summary: parsed.summary ?? "Training data analyzed.",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
    weeklyTrend: ["improving", "consistent", "declining"].includes(parsed.weeklyTrend)
      ? parsed.weeklyTrend
      : "consistent",
    generatedAt: new Date().toISOString(),
  }
}
