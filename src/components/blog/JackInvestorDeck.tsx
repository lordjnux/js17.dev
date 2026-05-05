"use client"

import { useState, useCallback } from "react"

/* ─── Brand tokens ───────────────────────────────────────────────────────── */

const J = {
  bg:      "#0b0b1e",
  surface: "#10102a",
  border:  "#1e1e40",
  green:   "#16c784",
  blue:    "#4a9eff",
  orange:  "#f5a623",
  red:     "#e84142",
  purple:  "#9b59b6",
  text:    "#e0e0e0",
  muted:   "#6b7280",
}

/* ─── Chip ───────────────────────────────────────────────────────────────── */

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: color + "22", color, border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  )
}

/* ─── Feature row ────────────────────────────────────────────────────────── */

function Feature({
  icon, label, note, live = true,
}: { icon: string; label: string; note: string; live?: boolean }) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl p-3"
      style={{ background: J.surface, border: `1px solid ${J.border}` }}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: J.text }}>{label}</span>
          <Chip label={live ? "LIVE" : "ROADMAP"} color={live ? J.green : J.orange} />
        </div>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: J.muted }}>{note}</p>
      </div>
    </div>
  )
}

/* ─── Revenue card ───────────────────────────────────────────────────────── */

function RevenueCard({
  icon, title, model, price, color,
}: { icon: string; title: string; model: string; price: string; color: string }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: J.surface, border: `1px solid ${color}33` }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="font-bold text-sm" style={{ color }}>{title}</span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: J.muted }}>{model}</p>
      <span
        className="self-start text-xs font-bold rounded-full px-2.5 py-0.5"
        style={{ background: color + "22", color, border: `1px solid ${color}44` }}
      >
        {price}
      </span>
    </div>
  )
}

/* ─── Stat bubble ────────────────────────────────────────────────────────── */

function StatBubble({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-3xl sm:text-4xl font-black font-mono" style={{ color }}>{value}</span>
      <span className="text-xs mt-1 max-w-[100px] leading-tight" style={{ color: J.muted }}>{label}</span>
    </div>
  )
}

/* ─── Roadmap item ───────────────────────────────────────────────────────── */

function RoadmapItem({ phase, label, items, color }: { phase: string; label: string; items: string[]; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: J.surface, border: `1px solid ${color}33` }}>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[10px] font-bold tracking-widest rounded-full px-2 py-0.5"
          style={{ background: color + "22", color }}
        >
          {phase}
        </span>
        <span className="text-sm font-bold" style={{ color: J.text }}>{label}</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: J.muted }}>
            <span style={{ color }}>›</span> {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── Slides definition ──────────────────────────────────────────────────── */

const SLIDES = [
  {
    tag: "01 — THE PROBLEM",
    title: "Reporting a hazard on Waze takes a tap — three seconds, eyes off the road.",
    render: () => (
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatBubble value="1.35M" label="road deaths per year (WHO)" color={J.red} />
          <StatBubble value="8+" label="distracted-driving deaths daily (US alone)" color={J.orange} />
          <StatBubble value="3.5B" label="smartphone drivers worldwide" color={J.blue} />
        </div>
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: J.surface, border: `1px solid ${J.border}` }}
        >
          {[
            "Waze: swipe to report a hazard — hands, eyes, attention.",
            "Google Maps: type your destination — while parked, hopefully.",
            "Phone calls: arrive through the same speaker as your turn.",
          ].map((line, i) => (
            <div key={i} className="flex items-start gap-2 text-sm" style={{ color: J.muted }}>
              <span style={{ color: J.red }}>✗</span> {line}
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: J.text }}>
          The problem is not that drivers are careless. The tools demand attention they cannot give. The road is right there &mdash; and the screen keeps asking for more.
        </p>
      </div>
    ),
  },
  {
    tag: "02 — THE SOLUTION",
    title: "Jack. Zero touch. Zero screen. Just your voice.",
    render: () => (
      <div className="space-y-4">
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: `linear-gradient(135deg, ${J.green}15, ${J.blue}15)`, border: `1px solid ${J.green}33` }}
        >
          <p className="text-lg font-bold font-mono" style={{ color: J.green }}>&ldquo;Hey Jack, police ahead.&rdquo;</p>
          <p className="text-xs mt-1" style={{ color: J.muted }}>Event reported, categorized, and visible to all nearby drivers in under 2 seconds.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: "🎙", label: "Voice-first", note: "The only interface is your voice. No screens. No taps. No distraction." },
            { icon: "🌐", label: "Community powered", note: "Every report is shared in real time via Firestore. The more drivers, the smarter the network." },
            { icon: "📍", label: "Proximity alerts", note: "Jack warns you at 500 m, 300 m, and 200 m — before you reach any hazard." },
            { icon: "🗺", label: "Nav relay", note: "Intercepts Google Maps/Waze turn-by-turn and reads them aloud. No app switch." },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-3 flex items-start gap-3"
              style={{ background: J.surface, border: `1px solid ${J.border}` }}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: J.text }}>{item.label}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: J.muted }}>{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: "03 — MVP FEATURES",
    title: "v0.1.1 — Built in 72 hours. Running on device.",
    render: () => (
      <div className="space-y-2.5">
        <Feature icon="🎙" label="Wake word detection" note='"Hey Jack" activates the assistant. Hands never leave the wheel.' live />
        <Feature icon="⚠️" label="Voice event reporting" note="Police, accidents, hazards, traffic — categorized automatically from speech." live />
        <Feature icon="🔥" label="Community reports via Firestore" note="Real-time sync across all users. Reports expire in 120 minutes automatically." live />
        <Feature icon="📡" label="GPS proximity alerts" note="TTS warnings at 500 m, 300 m, 200 m for any active community report." live />
        <Feature icon="🗺" label="Navigation relay" note="Reads Google Maps / Waze turn-by-turn instructions aloud." live />
        <Feature icon="🔵" label="Bluetooth auto-activation" note="Jack starts automatically when your phone pairs with your car. Zero manual steps." live={false} />
        <Feature icon="🚀" label="Android foreground service" note="Survives backgrounding, screen lock, and system pressure. Always on." live />
      </div>
    ),
  },
  {
    tag: "04 — ROADMAP",
    title: "The intelligence layer builds out in phases.",
    render: () => (
      <div className="space-y-3">
        <RoadmapItem
          phase="PHASE 3"
          label="AI Brain"
          color={J.purple}
          items={[
            "GPT-4o intent recognition — natural language, not keyword matching",
            "Destination setting by voice via Google Maps API",
            "Dynamic route changes mid-trip by voice command",
            "Smart event disambiguation (\"police\" vs \"police checkpoint\")",
          ]}
        />
        <RoadmapItem
          phase="PHASE 4"
          label="Platform Expansion"
          color={J.blue}
          items={[
            "Bluetooth / Android Auto / CarPlay automatic session start",
            "iOS + Apple CarPlay native support",
            "Offline event caching for poor-connectivity zones",
            "Google Play Store launch (package: dev.js17.jack)",
          ]}
        />
        <RoadmapItem
          phase="PHASE 5"
          label="Monetization"
          color={J.green}
          items={[
            "Premium subscription tier (AI features + custom wake word)",
            "Fleet management dashboard for logistics companies",
            "Anonymized road data API for municipalities and insurers",
            "Insurance partnership program (usage-based discount integration)",
          ]}
        />
      </div>
    ),
  },
  {
    tag: "05 — MARKET",
    title: "The road safety data layer doesn't exist yet.",
    render: () => (
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <StatBubble value="$22B" label="global navigation & road safety market" color={J.green} />
          <StatBubble value="600M+" label="Spanish-speaking smartphone users (initial target)" color={J.blue} />
          <StatBubble value="$1.1B" label="Waze acquisition by Google — the benchmark" color={J.orange} />
        </div>
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ background: J.surface, border: `1px solid ${J.border}` }}
        >
          <p className="text-xs font-bold tracking-widest" style={{ color: J.muted }}>MARKET SIZING</p>
          {[
            { label: "TAM", value: "$22B+", note: "Navigation + road safety tech globally" },
            { label: "SAM", value: "$3.2B", note: "Latin America + Spanish-speaking markets" },
            { label: "SOM (3yr)", value: "$45M", note: "Professional drivers + daily commuters, LatAm" },
          ].map(({ label, value, note }) => (
            <div key={label} className="flex items-center gap-3">
              <span
                className="text-[10px] font-bold w-10 flex-shrink-0 text-center rounded px-1 py-0.5"
                style={{ background: J.green + "22", color: J.green }}
              >
                {label}
              </span>
              <span className="font-bold text-sm w-16 flex-shrink-0" style={{ color: J.text }}>{value}</span>
              <span className="text-xs" style={{ color: J.muted }}>{note}</span>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: J.muted }}>
          Waze proved community-sourced road data at scale. Jack extends the model to the voice layer — the part Waze never solved.
        </p>
      </div>
    ),
  },
  {
    tag: "06 — BUSINESS MODEL",
    title: "Four revenue streams. One driver safety network.",
    render: () => (
      <div className="grid sm:grid-cols-2 gap-3">
        <RevenueCard
          icon="👤"
          title="B2C Freemium"
          model="Free: wake word, event reporting, proximity alerts. Premium: AI intent, custom wake word, multi-language, trip history."
          price="$2.99 / month"
          color={J.green}
        />
        <RevenueCard
          icon="🚛"
          title="Fleet SaaS"
          model="Real-time incident reporting, driver safety dashboard, route data, and compliance tooling for logistics companies."
          price="$15 / vehicle / month"
          color={J.blue}
        />
        <RevenueCard
          icon="📊"
          title="Data Licensing"
          model="Anonymized, aggregated road event data sold to municipalities, insurance companies, and navigation providers."
          price="Custom contracts"
          color={J.orange}
        />
        <RevenueCard
          icon="🛡"
          title="Insurance Partnerships"
          model="Usage-based insurance discount integration. Insurers reward safe, voice-first driving behavior verified by Jack."
          price="Revenue share"
          color={J.purple}
        />
      </div>
    ),
  },
  {
    tag: "07 — THE VISION",
    title: "We're not building a better GPS. We're building the co-pilot every driver deserves.",
    render: () => (
      <div className="space-y-5">
        <div
          className="rounded-xl p-5 text-center"
          style={{ background: `linear-gradient(135deg, ${J.green}12, ${J.blue}12)`, border: `1px solid ${J.green}30` }}
        >
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: J.text }}>
            &ldquo;No single app owns driver safety data at scale. Waze owns the map layer. Google owns the routing layer. <strong style={{ color: J.green }}>Nobody owns the voice layer.</strong>&rdquo;
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatBubble value="500K" label="users — Series A target" color={J.green} />
          <StatBubble value="3" label="launch markets in 18 months" color={J.blue} />
          <StatBubble value="5+" label="insurance partnerships at launch" color={J.orange} />
        </div>
        <div
          className="rounded-xl p-4"
          style={{ background: J.surface, border: `1px solid ${J.border}` }}
        >
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: J.muted }}>SEED ROUND — USE OF FUNDS</p>
          {[
            { label: "AI Integration (GPT-4o + Maps API)", pct: 35, color: J.purple },
            { label: "Google Play Launch + UA", pct: 25, color: J.green },
            { label: "iOS + CarPlay Development", pct: 20, color: J.blue },
            { label: "Team (2 engineers + BD)", pct: 20, color: J.orange },
          ].map(({ label, pct, color }) => (
            <div key={label} className="mb-2 last:mb-0">
              <div className="flex justify-between text-xs mb-1" style={{ color: J.muted }}>
                <span>{label}</span>
                <span style={{ color }}>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: J.border }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

/* ─── Main component ─────────────────────────────────────────────────────── */

export function JackInvestorDeck() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((next: number, dir: "forward" | "backward") => {
    if (animating || next === current) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(next)
      setAnimating(false)
    }, 220)
  }, [animating, current])

  const prev = () => current > 0 && goTo(current - 1, "backward")
  const next = () => current < SLIDES.length - 1 && goTo(current + 1, "forward")

  const slide = SLIDES[current]

  return (
    <div className="not-prose my-12 select-none">
      {/* Outer glow border */}
      <div
        className="p-px rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${J.green}88, ${J.blue}66, ${J.purple}55)`,
        }}
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: J.bg }}>

          {/* Header bar */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: `1px solid ${J.border}`, background: J.surface }}
          >
            <div className="flex items-center gap-3">
              <span className="font-black text-lg tracking-[4px]" style={{ color: J.text }}>JACK</span>
              <span className="text-[10px] font-semibold tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: J.green + "22", color: J.green }}>
                INVESTOR DECK
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] font-mono" style={{ color: J.green }}>v0.1.1 · LIVE</span>
            </div>
          </div>

          {/* Slide body */}
          <div className="p-5 sm:p-7 min-h-[480px] sm:min-h-[420px] flex flex-col">
            {/* Slide tag + title */}
            <div className="mb-5">
              <span
                className="text-[10px] font-bold tracking-[3px]"
                style={{ color: J.green }}
              >
                {slide.tag}
              </span>
              <h2
                className="text-base sm:text-lg font-bold mt-1 leading-snug"
                style={{ color: J.text }}
              >
                {slide.title}
              </h2>
            </div>

            {/* Animated slide content */}
            <div
              className="flex-1 transition-all duration-200"
              style={{
                opacity: animating ? 0 : 1,
                transform: animating
                  ? `translateX(${direction === "forward" ? "12px" : "-12px"})`
                  : "translateX(0)",
              }}
            >
              {slide.render()}
            </div>
          </div>

          {/* Footer nav */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: `1px solid ${J.border}`, background: J.surface }}
          >
            {/* Prev button */}
            <button
              onClick={prev}
              disabled={current === 0}
              className="flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 transition-all"
              style={{
                background: current === 0 ? "transparent" : J.surface,
                color: current === 0 ? J.border : J.text,
                border: `1px solid ${current === 0 ? J.border : J.green + "66"}`,
                cursor: current === 0 ? "default" : "pointer",
              }}
            >
              ← Prev
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? "forward" : "backward")}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? "20px" : "6px",
                    height: "6px",
                    background: i === current ? J.green : J.border,
                  }}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={next}
              disabled={current === SLIDES.length - 1}
              className="flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 transition-all"
              style={{
                background: current === SLIDES.length - 1 ? "transparent" : J.green + "22",
                color: current === SLIDES.length - 1 ? J.border : J.green,
                border: `1px solid ${current === SLIDES.length - 1 ? J.border : J.green + "66"}`,
                cursor: current === SLIDES.length - 1 ? "default" : "pointer",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs mt-3" style={{ color: J.muted }}>
        {current + 1} of {SLIDES.length} — use the arrows or dots to navigate
      </p>
    </div>
  )
}
