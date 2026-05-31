import { Suspense } from "react"
import Link from "next/link"
import { AnimatedSection } from "@/components/shared/AnimatedSection"
import { Button } from "@/components/ui/button"
import { SubscriberBadge } from "@/components/blog/SubscriberBadge"
import { ArrowRight, MessageSquare } from "lucide-react"
import { getTranslations } from "next-intl/server"

export async function CTASection() {
  const t = await getTranslations("home.cta")

  return (
    <section className="section-padding">
      <div className="container-custom">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-500/10 via-background to-background p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
            <div className="relative">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
                {t("subtitle")}
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("title")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
                {t("description")}
              </p>
              <Suspense fallback={null}>
                <SubscriberBadge className="mt-3 justify-center" />
              </Suspense>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" asChild className="group">
                  <Link href="/proposal">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    {t("startProposal")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link href="/blog">{t("readBlog")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
