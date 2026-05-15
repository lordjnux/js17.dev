import { JackHeroRoad } from "@/components/jack/JackHeroRoad"
import { JackTicker } from "@/components/jack/JackTicker"
import { JackCapabilities } from "@/components/jack/JackCapabilities"
import { JackFuture } from "@/components/jack/JackFuture"
import { JackNeuralGrid } from "@/components/jack/JackNeuralGrid"
import { JackVision } from "@/components/jack/JackVision"
import { JackBlogLinks } from "@/components/jack/JackBlogLinks"
import { JackMovement } from "@/components/jack/JackMovement"
import { JackWaitlistSection } from "@/components/jack/JackWaitlistSection"

export default function JackPage() {
  return (
    <div style={{ background: "#020408" }}>
      <JackHeroRoad />
      <JackTicker />
      <JackCapabilities />
      <JackFuture />
      <JackNeuralGrid />
      <JackVision />
      <JackBlogLinks />
      <JackMovement />
      <JackWaitlistSection />
    </div>
  )
}
