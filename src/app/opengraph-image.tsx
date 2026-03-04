import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Jeroham Sanchez — Senior AI-Augmented Fullstack Systems Engineer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080d1a",
          padding: "64px 72px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Top: domain badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "18px",
                fontWeight: 700,
                color: "#3b82f6",
                letterSpacing: "-0.01em",
              }}
            >
              js17.dev
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#22c55e", fontWeight: 500 }}>
              ● Available for projects
            </span>
          </div>
        </div>

        {/* Center: main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#f8fafc",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Jeroham Sanchez
          </h1>
          <p
            style={{
              fontSize: "28px",
              color: "#94a3b8",
              margin: 0,
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            Senior AI-Augmented Fullstack
            <span style={{ color: "#3b82f6", fontWeight: 600 }}> Systems Engineer</span>
          </p>
        </div>

        {/* Bottom: tech tags */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            {["TypeScript", "Next.js", "AI / LLMs", "PostgreSQL", "Docker"].map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(148,163,184,0.08)",
                  border: "1px solid rgba(148,163,184,0.15)",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  color: "#94a3b8",
                  fontSize: "15px",
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <span style={{ color: "#475569", fontSize: "15px" }}>8+ years experience</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
