import { Suspense } from "react"
import { getStravaStats } from "@/lib/strava"
import { getChessStats } from "@/lib/chess"
import { FitWellnessSection } from "@/components/hobbies/FitWellnessSection"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

export const revalidate = 21600

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "hobbies" })
  return {
    title: t("title"),
    description: t("description"),
  }
}

function HobbiesSkeleton() {
  return (
    <div className="container-custom py-12 md:py-16 space-y-8 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="h-16 w-96 rounded-lg bg-muted" />
      <div className="h-5 w-72 rounded-lg bg-muted" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  )
}

export default async function HobbiesPage() {
  const [stats, chess] = await Promise.all([getStravaStats(), getChessStats()])

  return (
    <main>
      <Suspense fallback={<HobbiesSkeleton />}>
        <FitWellnessSection stats={stats} chess={chess} />
      </Suspense>
    </main>
  )
}
