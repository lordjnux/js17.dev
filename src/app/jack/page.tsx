import { JackHero } from "@/components/jack/JackHero"
import { JackTicker } from "@/components/jack/JackTicker"
import { JackCapabilities } from "@/components/jack/JackCapabilities"
import { JackEcosystem } from "@/components/jack/JackEcosystem"
import { JackVision } from "@/components/jack/JackVision"
import { JackBlogLinks } from "@/components/jack/JackBlogLinks"
import { JackMovement } from "@/components/jack/JackMovement"
import { JackWaitlistSection } from "@/components/jack/JackWaitlistSection"

export default function JackPage() {
  return (
    <div style={{ background: "#050505" }}>
      <JackHero />
      <JackTicker />
      <JackCapabilities />
      <JackEcosystem />
      <JackVision />
      <JackBlogLinks />
      <JackMovement />
      <JackWaitlistSection />
    </div>
  )
}
