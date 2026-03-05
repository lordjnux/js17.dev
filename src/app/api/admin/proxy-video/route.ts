import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, ADMIN_EMAIL } from "@/lib/auth"

// Proxies a Shotstack video URL to the client to avoid CORS issues during YouTube upload
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return new Response("Unauthorized", { status: 401 })
  }

  const url = req.nextUrl.searchParams.get("url")
  if (!url) return new Response("Missing url", { status: 400 })

  // Whitelist Shotstack CDN — prevent SSRF / open redirect abuse
  const allowedHosts = ["api.shotstack.io", "shotstack-create-prod-output.s3-accelerate.amazonaws.com"]
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return new Response("Invalid url", { status: 400 })
  }
  if (!allowedHosts.some((h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith(`.${h}`))) {
    return new Response("URL not allowed", { status: 403 })
  }

  const videoRes = await fetch(url)
  if (!videoRes.ok) return new Response("Failed to fetch video", { status: 502 })

  return new Response(videoRes.body, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": "attachment; filename=video.mp4",
    },
  })
}
