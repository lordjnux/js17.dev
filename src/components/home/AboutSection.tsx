import { AnimatedSection } from "@/components/shared/AnimatedSection"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { CheckCircle2 } from "lucide-react"

const strengths = [
  "Full-cycle development: architecture → deploy → monitor",
  "AI integration specialist: LLMs, RAG, agentic workflows",
  "Security-first mindset with OWASP practices",
  "Async-first, remote collaboration expert",
  "Performance obsessed: Core Web Vitals, DB optimization",
  "Clear technical communication with non-technical stakeholders",
]

export function AboutSection() {
  return (
    <section id="about" className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <AnimatedSection direction="left">
            <SectionHeader
              label="About"
              title="Engineering systems that scale"
              align="left"
              className="mb-6"
            />
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                I&apos;m Jeroham Sanchez — a Senior Fullstack Systems Engineer with 8+ years
                of experience building production-grade web applications, APIs, and AI-powered
                systems for startups and enterprises.
              </p>
              <p>
                My specialty is the intersection of modern web engineering and AI — designing
                systems that use language models effectively, not just as a gimmick, but as a
                genuine multiplier for user value.
              </p>
              <p>
                I work in short, high-quality iteration cycles. You get clean code, solid
                documentation, and a system you can actually maintain and extend without me.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.1}>
            <div className="space-y-3">
              {strengths.map((strength, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{strength}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
