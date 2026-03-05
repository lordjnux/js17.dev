import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const data = searchParams.get("data")
  if (!data) return new Response("Missing data", { status: 400 })

  let slide: { title: string; bullets: string[]; slideNum: number; total: number }
  try {
    slide = JSON.parse(atob(data))
  } catch {
    return new Response("Invalid data", { status: 400 })
  }

  const { title, bullets, slideNum, total } = slide

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#080d1a",
          display: "flex",
          flexDirection: "column",
          padding: "60px 80px",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: 700, color: "#3b82f6" }}>
            js17.dev
          </span>
          <span style={{ fontSize: "14px", color: "#334155", fontFamily: "monospace" }}>
            {slideNum} / {total}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: title.length > 45 ? "38px" : title.length > 30 ? "46px" : "54px",
            fontWeight: 800,
            color: "#f8fafc",
            lineHeight: 1.15,
            marginBottom: "36px",
            letterSpacing: "-0.02em",
            maxWidth: "900px",
          }}
        >
          {title}
        </h1>

        {/* Bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1 }}>
          {bullets.slice(0, 5).map((bullet: string, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <span
                style={{
                  color: "#3b82f6",
                  fontSize: "22px",
                  marginTop: "2px",
                  flexShrink: 0,
                  lineHeight: 1.4,
                }}
              >
                ▸
              </span>
              <span style={{ color: "#94a3b8", fontSize: "22px", lineHeight: 1.5 }}>
                {bullet}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #3b82f6, #1d4ed8, #3b82f6)",
          }}
        />

        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: "4px",
            left: 0,
            height: "2px",
            width: `${(slideNum / total) * 100}%`,
            background: "rgba(255,255,255,0.15)",
          }}
        />
      </div>
    ),
    { width: 1280, height: 720 }
  )
}
