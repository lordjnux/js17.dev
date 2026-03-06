import Image from "next/image"
import { getCredlyBadges } from "@/lib/credly"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { ExternalLink, Award } from "lucide-react"

export async function CertificationsSection() {
  const username = process.env.CREDLY_USERNAME || ""
  const badges = await getCredlyBadges(username)

  // Don't render section if no username configured or no badges found
  if (!username || badges.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-6xl mx-auto px-4">
        <SectionHeader
          label="Credentials"
          title="Certifications & Badges"
          description="Verified credentials and skills from industry-leading platforms"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-10">
          {badges.map((badge) => (
            <a
              key={badge.id}
              href={`https://www.credly.com/users/${username}/badges`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center rounded-xl border bg-card p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <div className="relative w-20 h-20 mb-3 flex-shrink-0">
                {badge.badge_template.image_url ? (
                  <Image
                    src={badge.badge_template.image_url}
                    alt={badge.badge_template.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <p className="text-xs font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {badge.badge_template.name}
              </p>

              <p className="text-xs text-muted-foreground mt-1 truncate w-full">
                {badge.badge_template.issuer?.name}
              </p>

              {badge.badge_template.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {badge.badge_template.skills.slice(0, 3).map((s) => (
                    <span
                      key={s.name}
                      className="inline-block rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={`https://www.credly.com/users/${username}/badges`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View all credentials on Credly
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}
