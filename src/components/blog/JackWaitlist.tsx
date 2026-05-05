"use client"

import { useEffect, useRef, useState } from "react"

const J = {
  bg:      "#0b0b1e",
  surface: "#10102a",
  border:  "#1e1e40",
  green:   "#16c784",
  blue:    "#4a9eff",
  orange:  "#f5a623",
  red:     "#e84142",
  text:    "#e0e0e0",
  muted:   "#6b7280",
}

type Intention = "tester" | "investor" | "both"

const INTENTIONS: { value: Intention; icon: string; label: string; note: string; color: string }[] = [
  {
    value: "tester",
    icon: "🧪",
    label: "Early tester",
    note: "I want to be among the first to drive with Jack when v1.0 launches.",
    color: J.green,
  },
  {
    value: "investor",
    icon: "💼",
    label: "Investor",
    note: "I am interested in the Jack opportunity and want to connect with the founder.",
    color: J.blue,
  },
  {
    value: "both",
    icon: "🚀",
    label: "Both",
    note: "I want early access AND I am interested in investing in Jack.",
    color: J.orange,
  },
]

const SUCCESS_MESSAGES: Record<Intention, { title: string; body: string }> = {
  tester:   { title: "You're on the early access list.", body: "We'll send you the download link the moment Jack v1.0 hits the Play Store." },
  investor: { title: "We've received your interest.", body: "Jeroham will reach out to you directly to discuss the Jack opportunity." },
  both:     { title: "You're on the list.", body: "We'll send the launch notification and Jeroham will reach out about the investment opportunity." },
}

function Checkbox({
  checked, onChange,
}: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="h-4 w-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
      style={{
        background: checked ? J.green : "transparent",
        border: `2px solid ${checked ? J.green : J.border}`,
      }}
      onClick={() => onChange(!checked)}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

export function JackWaitlist() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const [email, setEmail]         = useState("")
  const [intention, setIntention] = useState<Intention | null>(null)
  const [legal, setLegal]         = useState(false)
  const [status, setStatus]       = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage]     = useState("")

  const clearError = () => { if (status === "error") { setStatus("idle"); setMessage("") } }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!intention) {
      setStatus("error")
      setMessage("Please select how you would like to be involved with Jack.")
      return
    }
    if (!legal) {
      setStatus("error")
      setMessage("You must accept the Privacy Policy and Habeas Data Policy to continue.")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/jack/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), intention, legalAccepted: true }),
      })
      const data = await res.json() as { message?: string; error?: string }

      if (res.ok) {
        setStatus("success")
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong. Try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }

  const successMsg = intention ? SUCCESS_MESSAGES[intention] : SUCCESS_MESSAGES.tester

  return (
    <div
      ref={ref}
      className="not-prose my-12"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <div
        className="p-px rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${J.green}99, ${J.blue}55)` }}
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: J.bg }}>
          <div style={{ height: "3px", background: `linear-gradient(90deg, ${J.green}, ${J.blue})` }} />

          <div className="px-6 py-8 sm:px-10 sm:py-10">

            {status === "success" ? (
              /* ── Success ── */
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: J.green + "22", border: `2px solid ${J.green}66` }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke={J.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: J.text }}>{successMsg.title}</p>
                  <p className="text-sm mt-1 max-w-sm" style={{ color: J.muted }}>{successMsg.body}</p>
                </div>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} noValidate>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:gap-5 gap-4 mb-7">
                  <div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: J.green + "18", border: `1px solid ${J.green}40` }}
                  >
                    🚗
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight" style={{ color: J.text }}>
                      Be the first to drive with Jack
                    </h3>
                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: J.muted }}>
                      Jack v1.0 is coming to the Google Play Store. Tell us how you&apos;d like
                      to be involved — then leave your email and we&apos;ll reach out when it matters.
                    </p>
                  </div>
                </div>

                {/* Intention cards */}
                <div className="mb-6">
                  <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: J.muted }}>
                    I AM INTERESTED AS A…
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {INTENTIONS.map((opt) => {
                      const selected = intention === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setIntention(opt.value); clearError() }}
                          className="rounded-xl p-4 text-left transition-all duration-200"
                          style={{
                            background: selected ? opt.color + "14" : J.surface,
                            border: `2px solid ${selected ? opt.color : J.border}`,
                            cursor: "pointer",
                          }}
                        >
                          <span className="text-2xl block mb-2">{opt.icon}</span>
                          <span
                            className="block text-sm font-bold mb-1"
                            style={{ color: selected ? opt.color : J.text }}
                          >
                            {opt.label}
                          </span>
                          <span className="block text-xs leading-relaxed" style={{ color: J.muted }}>
                            {opt.note}
                          </span>
                          {/* Selection indicator dot */}
                          <div className="flex justify-end mt-3">
                            <div
                              className="h-3 w-3 rounded-full transition-all"
                              style={{
                                background: selected ? opt.color : "transparent",
                                border: `2px solid ${selected ? opt.color : J.border}`,
                              }}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Email input */}
                <div className="mb-4">
                  <label
                    htmlFor="jack-waitlist-email"
                    className="block text-xs font-semibold mb-2 tracking-wide"
                    style={{ color: J.muted }}
                  >
                    YOUR EMAIL
                  </label>
                  <input
                    id="jack-waitlist-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError() }}
                    placeholder="you@example.com"
                    disabled={status === "loading"}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: J.surface,
                      border: `1px solid ${status === "error" ? J.red + "99" : J.border}`,
                      color: J.text,
                      caretColor: J.green,
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = J.green + "88" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = status === "error" ? J.red + "99" : J.border }}
                  />
                </div>

                {/* Legal consent */}
                <div className="mb-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="mt-0.5">
                      <Checkbox checked={legal} onChange={(v) => { setLegal(v); clearError() }} />
                    </div>
                    <span className="text-xs leading-relaxed" style={{ color: J.muted }}>
                      I agree to be contacted about Jack and accept the{" "}
                      <a href="/legal/privacy" target="_blank" rel="noopener noreferrer"
                        className="underline underline-offset-2" style={{ color: J.green }}>
                        Privacy Policy
                      </a>{" "}and{" "}
                      <a href="/legal/habeas-data" target="_blank" rel="noopener noreferrer"
                        className="underline underline-offset-2" style={{ color: J.green }}>
                        Habeas Data Policy
                      </a>.
                      {" "}No spam — only relevant Jack updates.
                    </span>
                  </label>
                </div>

                {/* Error */}
                {status === "error" && message && (
                  <p className="text-xs mb-4 rounded-lg px-3 py-2"
                    style={{ color: J.red, background: J.red + "12", border: `1px solid ${J.red}33` }}>
                    {message}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "loading" || !email.trim()}
                  className="w-full rounded-xl py-3 text-sm font-bold tracking-wide transition-all"
                  style={{
                    background: status === "loading" || !email.trim() ? J.green + "44" : J.green,
                    color: status === "loading" || !email.trim() ? J.green : "#0b0b1e",
                    cursor: status === "loading" || !email.trim() ? "not-allowed" : "pointer",
                    border: "none",
                  }}
                >
                  {status === "loading" ? "Joining…" : "Join the Waitlist →"}
                </button>

                <p className="text-center text-xs mt-4" style={{ color: J.muted }}>
                  No spam. One email — relevant to your selection above.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
