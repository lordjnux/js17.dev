"use client"

const ITEMS = [
  "Voice First",
  "Community Hazards",
  "Android Auto",
  "Always On",
  "Hey Jack",
  "Background Service",
  "Weather Briefing",
  "Fleet Ready",
  "Zero Screen Taps",
  "Natural Language",
  "Auto-Start on Bluetooth",
  "Turn-by-Turn Audio",
]

function TickerItem({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-3 px-4">
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ background: "#00D4FF", opacity: 0.5 }}
      />
      <span className="text-sm font-semibold tracking-widest uppercase whitespace-nowrap" style={{ color: "#00D4FF" }}>
        {label}
      </span>
    </span>
  )
}

export function JackTicker() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div
      className="relative overflow-hidden py-4"
      style={{ background: "#0a0a14", borderTop: "1px solid rgba(0,212,255,0.08)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}
    >
      {/* Left fade */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20"
        style={{ background: "linear-gradient(90deg, #0a0a14, transparent)" }}
      />
      {/* Right fade */}
      <div
        className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20"
        style={{ background: "linear-gradient(270deg, #0a0a14, transparent)" }}
      />

      <div
        className="flex"
        style={{ animation: "jackTicker 40s linear infinite", width: "max-content" }}
      >
        {doubled.map((label, i) => (
          <TickerItem key={i} label={label} />
        ))}
      </div>

      <style>{`
        @keyframes jackTicker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
