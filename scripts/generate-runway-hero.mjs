/**
 * Generates the Jack hero road video via Runway Gen-4 Turbo API.
 * Saves result to public/jack/hero-road.mp4
 *
 * Usage: node scripts/generate-runway-hero.mjs
 */

import { createWriteStream, mkdirSync } from "fs"
import { pipeline } from "stream/promises"

const API_KEY = "key_24a8ab069de027e6976fcfac1cc60feddb5d389f27f66f043167865709f2b42ac01e18fc43b8a8920bec32cdd0edf55b71bdb72c2e21d6b47615cc83547623b3"
const BASE = "https://api.dev.runwayml.com"
const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "X-Runway-Version": "2024-11-06",
}

const PROMPT = `Cinematic first-person POV from inside a luxury car driving on a dark wet highway at 2am.
Rain drops on the windshield. City lights blurring beautifully in the distance.
Headlights illuminate dark wet asphalt ahead. No other traffic.
Dashboard glow is a soft electric blue. Ultra photorealistic.
4K quality. Slow cinematic motion. Blade Runner noir aesthetic.
No text, no HUD, no UI elements. Extremely immersive.`

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function createTask() {
  console.log("🎬 Submitting generation task to Runway Gen-4 Turbo…")

  const res = await fetch(`${BASE}/v1/text_to_video`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "gen4.5",
      promptText: PROMPT,
      duration: 10,
      ratio: "1280:720",
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Runway API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  console.log(`✅ Task created: ${data.id}`)
  return data.id
}

async function pollTask(taskId) {
  console.log("⏳ Polling for completion…")
  let attempts = 0

  while (attempts < 120) {  // max 10 min polling
    await sleep(5000)
    attempts++

    const res = await fetch(`${BASE}/v1/tasks/${taskId}`, { headers: HEADERS })
    if (!res.ok) {
      console.warn(`Poll attempt ${attempts} failed: ${res.status}`)
      continue
    }

    const data = await res.json()
    const status = data.status ?? data.progressRatio

    if (data.status === "SUCCEEDED" || data.status === "succeeded") {
      const url = data.output?.[0] ?? data.artifacts?.[0]?.url
      if (!url) throw new Error("No output URL in SUCCEEDED response")
      console.log(`✅ SUCCEEDED — output: ${url}`)
      return url
    }

    if (data.status === "FAILED" || data.status === "failed") {
      throw new Error(`Task FAILED: ${JSON.stringify(data.error ?? data)}`)
    }

    const progress = data.progressRatio != null ? ` (${Math.round(data.progressRatio * 100)}%)` : ""
    console.log(`  → ${data.status ?? "pending"}${progress} — attempt ${attempts}`)
  }

  throw new Error("Timed out waiting for Runway task")
}

async function downloadVideo(url, dest) {
  console.log(`⬇️  Downloading video → ${dest}`)
  mkdirSync("public/jack", { recursive: true })

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)

  await pipeline(res.body, createWriteStream(dest))
  console.log(`✅ Video saved to ${dest}`)
}

async function main() {
  try {
    const taskId = await createTask()
    const videoUrl = await pollTask(taskId)
    await downloadVideo(videoUrl, "public/jack/hero-road.mp4")
    console.log("\n🎉 Done! Add hero-road.mp4 to JackHeroRoad.tsx <video> tag.")
  } catch (err) {
    console.error("❌ Error:", err.message)
    process.exit(1)
  }
}

main()
