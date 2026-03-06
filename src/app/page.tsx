import { HeroSection } from "@/components/home/HeroSection"
import { AboutSection } from "@/components/home/AboutSection"
import { TechStackSection } from "@/components/home/TechStackSection"
import { GitHubStatsSection } from "@/components/home/GitHubStatsSection"
import { CertificationsSection } from "@/components/home/CertificationsSection"
import { CTASection } from "@/components/home/CTASection"

export const revalidate = 3600

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <TechStackSection />
      <GitHubStatsSection />
      <CertificationsSection />
      <CTASection />
    </>
  )
}
