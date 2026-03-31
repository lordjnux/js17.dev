import { Suspense } from "react"
import { getStravaStats } from "@/lib/strava"
import { getChessStats } from "@/lib/chess"
import { FitWellnessSection } from "@/components/hobbies/FitWellnessSection"
import type { Metadata } from "next"

export const revalidate = 21600 // 6h ISR

export const metadata: Metadata = {
  title: "Hobbies & Life Stats",
  description:
    "Beyond the code — running stats, chess ratings, and the systems thinking I apply outside the terminal. Fitness, chess, music: all integrated.",
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
