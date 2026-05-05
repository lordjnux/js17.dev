"use client"

import { useEffect, useRef, useState } from "react"

const J = {
  bg:      "#0b0b1e",
  surface: "#10102a",
  border:  "#1e1e40",
  green:   "#16c784",
  blue:    "#4a9eff",
  red:     "#e84142",
  text:    "#e0e0e0",
  muted:   "#6b7280",
}

export function JackWaitlist() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const [email, setEmail] = useState("")
  const [legal, setLegal] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!legal) {
      setStatus("error")
      setMessage("You must accept the privacy policy to join the waitlist.")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/jack/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), legalAccepted: true }),
      })
      const data = await res.json() as { message?: string; error?: string }

      if (res.ok) {
        setStatus("success")
        setMessage(data.message || "You are on the list.")
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong. Try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }

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
      {/* Outer glow border */}
      <div
        className="p-px rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${J.green}99, ${J.blue}55)` }}
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: J.bg }}>

          {/* Top accent bar */}
          <div style={{ height: "3px", background: `linear-gradient(90deg, ${J.green}, ${J.blue})` }} />

          <div className="px-6 py-8 sm:px-10 sm:py-10">

            {status === "success" ? (
              /* ── Success state ── */
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
                  <p className="text-lg font-bold" style={{ color: J.text }}>
                    You&apos;re on the list.
                  </p>
                  <p className="text-sm mt-1" style={{ color: J.muted }}>
                    We&apos;ll send you an email the moment Jack v1.0 is ready to drive.
                  </p>
                </div>
              </div>
            ) : (
              /* ── Form state ── */
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
                      Jack v1.0 is coming to the Google Play Store. Join the waitlist and
                      get notified the moment it&apos;s ready — no spam, one email only.
                    </p>
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
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status === "error") { setStatus("idle"); setMessage("") }
                    }}
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
                  <label className="flex items-start gap-3 cursor-pointer group">
                    {/* Custom checkbox */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={legal}
                        onChange={(e) => {
                          setLegal(e.target.checked)
                          if (status === "error") { setStatus("idle"); setMessage("") }
                        }}
                        className="sr-only"
                      />
                      <div
                        className="h-4 w-4 rounded flex items-center justify-center transition-all"
                        style={{
                          background: legal ? J.green : "transparent",
                          border: `2px solid ${legal ? J.green : J.border}`,
                        }}
                      >
                        {legal && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs leading-relaxed" style={{ color: J.muted }}>
                      I agree to be notified when Jack v1.0 launches and accept the{" "}
                      <a
                        href="/legal/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                        style={{ color: J.green }}
                      >
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a
                        href="/legal/habeas-data"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                        style={{ color: J.green }}
                      >
                        Habeas Data Policy
                      </a>
                      . One notification email only — no marketing.
                    </span>
                  </label>
                </div>

                {/* Error message */}
                {status === "error" && message && (
                  <p className="text-xs mb-4 rounded-lg px-3 py-2" style={{ color: J.red, background: J.red + "12", border: `1px solid ${J.red}33` }}>
                    {message}
                  </p>
                )}

                {/* Submit button */}
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

                {/* Trust note */}
                <p className="text-center text-xs mt-4" style={{ color: J.muted }}>
                  No spam. No marketing. One email — when v1.0 ships.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
