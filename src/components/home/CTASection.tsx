import Link from "next/link"
import { AnimatedSection } from "@/components/shared/AnimatedSection"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare } from "lucide-react"

export function CTASection() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-500/10 via-background to-background p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
            <div className="relative">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
                Let&apos;s Work Together
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Have a project in mind?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
                I&apos;m currently available for freelance engagements. Tell me about your project
                and I&apos;ll get back to you within 24 hours.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" asChild className="group">
                  <Link href="/proposal">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Start a Proposal
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link href="/blog">Read My Blog</Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
