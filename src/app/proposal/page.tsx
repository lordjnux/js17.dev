import { ProposalForm } from "@/components/proposal/ProposalForm"
import { Video, FileText, ExternalLink, Heart } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Work With Me",
  description:
    "Support my open work or send a project proposal — two ways to connect and collaborate.",
}

export default function ProposalPage() {
  return (
    <div className="container-custom py-12 md:py-16">
      <div className="max-w-2xl mx-auto">

        {/* Page Header */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 mb-3">
            Work With Me
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
            Connect or Collaborate
          </h1>
          <p className="text-muted-foreground">
            Support the open work I create, or bring me in for a project — pick your path below.
          </p>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 1 — Support My Work
        ═══════════════════════════════════════ */}
        <section className="mb-16">
          <div className="mb-5 flex items-start gap-2.5">
            <Heart className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-base font-bold leading-snug">Support My Work</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Fuel the open-source tools, articles, and content I ship publicly.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">

            {/* BMaC */}
            <a
              href="https://buymeacoffee.com/jerohamsanchez"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl border-2 border-[#FFDD00]/40 bg-[#FFDD00]/5 p-5 transition-all duration-200 hover:border-[#FFDD00]/80 hover:bg-[#FFDD00]/10 hover:shadow-md hover:shadow-[#FFDD00]/10"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFDD00]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/buymeacoffee-logo.svg"
                  alt="Buy Me a Coffee"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </div>
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#b8a000] mb-1">
                One-time
              </p>
              <h3 className="text-sm font-bold mb-2 leading-snug">Buy Me a Coffee</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
                A quick coffee keeps the open work flowing. No commitment needed.
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFDD00] px-3 py-1.5 text-xs font-bold text-black transition-all group-hover:bg-[#f5d400]">
                Support now
                <ExternalLink className="h-3 w-3" />
              </span>
            </a>

            {/* PayPal */}
            <a
              href="https://www.paypal.com/paypalme/jerohamsanchez"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl border-2 border-[#009cde]/30 bg-[#009cde]/5 p-5 transition-all duration-200 hover:border-[#009cde]/60 hover:bg-[#009cde]/10 hover:shadow-md hover:shadow-[#009cde]/10"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#003087]">
                <PayPalMark />
              </div>
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#009cde] mb-1">
                Direct
              </p>
              <h3 className="text-sm font-bold mb-2 leading-snug">PayPal</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
                Send any amount directly via PayPal. Fast, trusted, worldwide.
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#003087] px-3 py-1.5 text-xs font-bold text-white transition-all group-hover:bg-[#002070]">
                Send via PayPal
                <ExternalLink className="h-3 w-3" />
              </span>
            </a>

            {/* Virtual Call — Coming Soon */}
            <div className="relative flex flex-col rounded-xl border border-border/40 bg-muted/20 p-5 opacity-60 cursor-not-allowed select-none">
              <div className="absolute top-3 right-3">
                <span className="rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground/70 uppercase tracking-widest">
                  Soon
                </span>
              </div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50">
                <Video className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">
                Live
              </p>
              <h3 className="text-sm font-bold mb-2 leading-snug text-muted-foreground">
                Virtual Call
              </h3>
              <p className="text-xs text-muted-foreground/60 leading-relaxed flex-1 mb-4">
                Schedule a live session to discuss your project in real time.
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-1.5 text-xs font-bold text-muted-foreground/50">
                Coming soon
              </span>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 2 — Start a Project
        ═══════════════════════════════════════ */}
        <section>
          <div className="border-t pt-12 mb-8">
            <div className="flex items-start gap-2.5 mb-3">
              <FileText className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-base font-bold leading-snug">Start a Project</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Have an idea, a system to build, or a team that needs a senior engineer?
                  Fill the form — I&apos;ll reply with a tailored proposal within 24 hours on business days.
                </p>
              </div>
            </div>
          </div>

          <div id="proposal-form" className="scroll-mt-24">
            <ProposalForm />
          </div>
        </section>

      </div>
    </div>
  )
}

/** Inline PayPal double-P mark — white on dark blue container */
function PayPalMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* Back P (lighter opacity) */}
      <path
        d="M8 2.5h5.5c2.2 0 3.5 1.3 3.5 3.2 0 2.6-1.8 4.3-4.5 4.3H10L8.8 16.5H6L8 2.5z"
        fill="white"
        opacity="0.55"
      />
      {/* Front P */}
      <path
        d="M5.5 5.5H11c2.2 0 3.5 1.3 3.5 3.2 0 2.6-1.8 4.3-4.5 4.3H7.5L6.3 19.5H3.5L5.5 5.5z"
        fill="white"
      />
    </svg>
  )
}
