import { AnimatedSection } from "@/components/shared/AnimatedSection"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { CheckCircle2 } from "lucide-react"
import { getTranslations } from "next-intl/server"

export async function AboutSection() {
  const t = await getTranslations("home")

  const strengths = [
    t("strengths.item1"),
    t("strengths.item2"),
    t("strengths.item3"),
    t("strengths.item4"),
    t("strengths.item5"),
    t("strengths.item6"),
  ]

  return (
    <section id="about" className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <AnimatedSection direction="left">
            <SectionHeader
              label={t("about.label")}
              title={t("about.title")}
              align="left"
              className="mb-6"
            />
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("about.bio1")}</p>
              <p>{t("about.bio2")}</p>
              <p>{t("about.bio3")}</p>
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
