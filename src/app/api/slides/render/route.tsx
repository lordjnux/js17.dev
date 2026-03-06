import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const data = searchParams.get("data")
  if (!data) return new Response("Missing data", { status: 400 })

  let slide: { title: string; bullets: string[]; slideNum: number; total: number; format?: string }
  try {
    slide = JSON.parse(atob(data))
  } catch {
    return new Response("Invalid data", { status: 400 })
  }

  const { title, bullets, slideNum, total, format } = slide
  const isShort = format === "short"

  if (isShort) {
    // Vertical 1080×1920 layout for YouTube Shorts
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#080d1a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "100px 80px",
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
                "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: "-200px",
              right: "-200px",
              width: "800px",
              height: "800px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Brand */}
          <span style={{ fontFamily: "monospace", fontSize: "28px", fontWeight: 700, color: "#3b82f6", marginBottom: "60px" }}>
            js17.dev
          </span>

          {/* Title */}
          <h1
            style={{
              fontSize: title.length > 30 ? "68px" : "84px",
              fontWeight: 900,
              color: "#f8fafc",
              lineHeight: 1.1,
              marginBottom: "48px",
              letterSpacing: "-0.03em",
              textAlign: "center",
            }}
          >
            {title}
          </h1>

          {/* Divider */}
          <div style={{ width: "60px", height: "3px", background: "#3b82f6", borderRadius: "2px", marginBottom: "48px" }} />

          {/* Bullets */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", width: "100%" }}>
            {bullets.slice(0, 3).map((bullet: string, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ color: "#3b82f6", fontSize: "28px", flexShrink: 0 }}>▸</span>
                <span style={{ color: "#94a3b8", fontSize: "32px", lineHeight: 1.4, textAlign: "center" }}>{bullet}</span>
              </div>
            ))}
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: "12px", position: "absolute", bottom: "80px" }}>
            {Array.from({ length: total }).map((_: unknown, i: number) => (
              <div
                key={i}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: i + 1 === slideNum ? "#3b82f6" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
        </div>
      ),
      { width: 1080, height: 1920 }
    )
  }

  // Horizontal 1280×720 layout (default)
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
