import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Title is fetched from route params — no fs/path imports needed in Edge runtime
export default async function OG({ params }: { params: { slug: string } }) {
  // Convert slug to readable title: "my-post-title" → "My Post Title"
  const slugTitle = params.slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

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
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: 700, color: "#3b82f6" }}>
            js17.dev
          </span>
          <span style={{ color: "#334155", fontSize: "20px" }}>/</span>
          <span style={{ color: "#64748b", fontSize: "20px" }}>blog</span>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "6px",
              padding: "6px 14px",
              width: "fit-content",
            }}
          >
            <span style={{ color: "#60a5fa", fontSize: "15px", fontWeight: 500 }}>
              ✦ Technical Article
            </span>
          </div>
          <h1
            style={{
              fontSize: slugTitle.length > 50 ? "52px" : "64px",
              fontWeight: 800,
              color: "#f8fafc",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: "960px",
            }}
          >
            {slugTitle}
          </h1>
        </div>

        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "16px",
              }}
            >
              JS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "17px" }}>
                Jeroham Sanchez
              </span>
              <span style={{ color: "#64748b", fontSize: "14px" }}>
                Senior AI-Augmented Fullstack Engineer
              </span>
            </div>
          </div>
          <span style={{ color: "#3b82f6", fontFamily: "monospace", fontSize: "18px", fontWeight: 700 }}>
            js17.dev
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
