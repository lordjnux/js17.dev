import { AnimatedSection } from "@/components/shared/AnimatedSection"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Badge } from "@/components/ui/badge"
import { TECH_STACK } from "@/lib/constants"

const categoryIcons: Record<string, string> = {
  AI: "🤖",
  Frontend: "🎨",
  Backend: "⚙️",
  DevOps: "☁️",
  Security: "🔒",
  Testing: "🧪",
}

export function TechStackSection() {
  return (
    <section id="tech" className="section-padding">
      <div className="container-custom">
        <AnimatedSection>
          <SectionHeader
            label="Tech Stack"
            title="Tools & Technologies"
            description="Battle-tested tools I reach for when building production systems"
          />
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(TECH_STACK) as [string, readonly { name: string; level: string }[]][]).map(
            ([category, skills], i) => (
              <AnimatedSection key={category} delay={i * 0.08} direction="up">
                <div className="rounded-lg border bg-card p-6 h-full">
                  <h3 className="mb-4 font-semibold flex items-center gap-2">
                    <span>{categoryIcons[category]}</span>
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill.name}
                        variant={skill.level === "expert" ? "electric" : "secondary"}
                        className="text-xs"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )
          )}
        </div>
      </div>
    </section>
  )
}
