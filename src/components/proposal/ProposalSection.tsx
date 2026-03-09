"use client"

import { useState, useRef } from "react"
import { ProposalForm } from "./ProposalForm"
import { Video, FileText, ArrowDown, ChevronDown } from "lucide-react"

export function ProposalSection() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  function handleOpen() {
    setOpen(true)
    // Wait for render, then scroll into view
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  return (
    <>
      {/* Contact options */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">

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
            Schedule a live session to scope your project in real time.
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-1.5 text-xs font-bold text-muted-foreground/50">
            Coming soon
          </span>
        </div>

        {/* Formal Proposal — toggles form */}
        <button
          type="button"
          onClick={handleOpen}
          className="group flex flex-col rounded-xl border-2 border-blue-500/25 bg-blue-500/5 p-5 text-left transition-all duration-200 hover:border-blue-500/50 hover:bg-blue-500/8 hover:shadow-md hover:shadow-blue-500/10"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400/70 mb-1">
            Detailed
          </p>
          <h3 className="text-sm font-bold mb-2 leading-snug">Send a Proposal</h3>
          <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
            Full project scoping form. I&apos;ll reply with a tailored proposal within 24 hours.
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/15 border border-blue-500/25 px-3 py-1.5 text-xs font-bold text-blue-400 transition-all group-hover:bg-blue-500/25">
            Fill the form
            {open ? <ChevronDown className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          </span>
        </button>

      </div>

      {/* Collapsible form */}
      <div
        ref={formRef}
        id="proposal-form"
        className="scroll-mt-24 overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: open ? "9999px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="border-t pt-10 mb-8">
          <h3 className="text-base font-bold mb-1">Formal Proposal</h3>
          <p className="text-sm text-muted-foreground">
            Takes about 5 minutes. I&apos;ll review your details and respond within 24 hours on business days.
          </p>
        </div>
        <ProposalForm />
      </div>
    </>
  )
}
