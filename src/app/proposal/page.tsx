import { ProposalForm } from "@/components/proposal/ProposalForm"
import { Video, FileText, ExternalLink, ArrowDown } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Work With Me",
  description:
    "Three ways to work together — buy me a coffee, schedule a virtual call, or send a full project proposal.",
}

export default function ProposalPage() {
  return (
    <div className="container-custom py-12 md:py-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 mb-3">
            Work With Me
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
            Choose How to Connect
          </h1>
          <p className="text-muted-foreground">
            Three ways to work together — from a quick coffee to a full project engagement.
          </p>
        </div>

        {/* 3 Option Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-14">

          {/* Option 1: Buy Me a Coffee */}
          <a
            href="https://buymeacoffee.com/jerohamsanchez"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col rounded-xl border-2 border-[#FFDD00]/40 bg-[#FFDD00]/5 p-5 transition-all duration-200 hover:border-[#FFDD00]/80 hover:bg-[#FFDD00]/10 hover:shadow-md hover:shadow-[#FFDD00]/10"
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
              Quickest
            </p>
            <h2 className="text-sm font-bold mb-2 leading-snug">Buy Me a Coffee</h2>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
              Support my open work with a one-time coffee. No commitment needed.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFDD00] px-3 py-1.5 text-xs font-bold text-black transition-all group-hover:bg-[#f5d400]">
              Support now
              <ExternalLink className="h-3 w-3" />
            </span>
          </a>

          {/* Option 2: Virtual Call — Coming Soon */}
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
            <h2 className="text-sm font-bold mb-2 leading-snug text-muted-foreground">
              Virtual Call
            </h2>
            <p className="text-xs text-muted-foreground/60 leading-relaxed flex-1 mb-4">
              Schedule a live session to discuss your project in real time.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-1.5 text-xs font-bold text-muted-foreground/50">
              Coming soon
            </span>
          </div>

          {/* Option 3: Formal Proposal */}
          <a
            href="#proposal-form"
            className="group flex flex-col rounded-xl border-2 border-blue-500/25 bg-blue-500/5 p-5 transition-all duration-200 hover:border-blue-500/50 hover:bg-blue-500/8 hover:shadow-md hover:shadow-blue-500/10"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400/70 mb-1">
              Detailed
            </p>
            <h2 className="text-sm font-bold mb-2 leading-snug">Send a Proposal</h2>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
              Full project scoping form. I&apos;ll reply with a tailored proposal within 24 hours.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/15 border border-blue-500/25 px-3 py-1.5 text-xs font-bold text-blue-400 transition-all group-hover:bg-blue-500/25">
              Fill the form
              <ArrowDown className="h-3 w-3" />
            </span>
          </a>

        </div>

        {/* Proposal Form Section */}
        <div id="proposal-form" className="scroll-mt-24">
          <div className="mb-8 border-t pt-10">
            <h2 className="text-lg font-bold mb-1">Formal Proposal</h2>
            <p className="text-sm text-muted-foreground">
              Takes about 5 minutes. I&apos;ll review your details and respond within 24 hours on business days.
            </p>
          </div>
          <ProposalForm />
        </div>

      </div>
    </div>
  )
}
