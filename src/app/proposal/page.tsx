import { ProposalForm } from "@/components/proposal/ProposalForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Request a Proposal",
  description:
    "Tell me about your project and I'll get back to you with a tailored proposal within 24 hours.",
}

export default function ProposalPage() {
  return (
    <div className="container-custom py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 mb-3">
            Work With Me
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
            Request a Proposal
          </h1>
          <p className="text-muted-foreground">
            Takes about 5 minutes. I&apos;ll review your details and respond within 24 hours
            on business days.
          </p>
        </div>

        <ProposalForm />
      </div>
    </div>
  )
}
