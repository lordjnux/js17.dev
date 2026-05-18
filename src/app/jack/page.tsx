import { JackHeroVoid } from "@/components/jack/JackHeroVoid"
import { JackTicker } from "@/components/jack/JackTicker"
import { JackCapabilities } from "@/components/jack/JackCapabilities"
import { JackFuture } from "@/components/jack/JackFuture"
import { JackWorldMap } from "@/components/jack/JackWorldMap"
import { JackVision } from "@/components/jack/JackVision"
import { JackBlogLinks } from "@/components/jack/JackBlogLinks"
import { JackMovement } from "@/components/jack/JackMovement"
import { JackWaitlistSection } from "@/components/jack/JackWaitlistSection"
import { JackVoidReveal } from "@/components/jack/JackVoidReveal"

export default function JackPage() {
  return (
    <div style={{ background: "#020408" }}>
      <JackHeroVoid />
      <JackVoidReveal>
        <JackTicker />
      </JackVoidReveal>
      <JackVoidReveal voiceLine="I hear you before you speak.">
        <JackCapabilities />
      </JackVoidReveal>
      <JackVoidReveal voiceLine="I see what you can't.">
        <JackFuture />
      </JackVoidReveal>
      <JackVoidReveal voiceLine="I'm everywhere you're going.">
        <JackWorldMap />
      </JackVoidReveal>
      <JackVoidReveal voiceLine="The road ahead is already mapped.">
        <JackVision />
      </JackVoidReveal>
      <JackVoidReveal>
        <JackBlogLinks />
      </JackVoidReveal>
      <JackVoidReveal>
        <JackMovement />
      </JackVoidReveal>
      <JackVoidReveal voiceLine="Stop imagining. Download Jack.">
        <JackWaitlistSection />
      </JackVoidReveal>
    </div>
  )
}
