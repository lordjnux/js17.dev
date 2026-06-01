import { Suspense } from "react"
import { getAllPosts } from "@/lib/mdx"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { NewsletterSignup } from "@/components/blog/NewsletterSignup"
import { PushSubscribe } from "@/components/blog/PushSubscribe"
import { BlogFeed } from "@/components/blog/BlogFeed"
import { BlogTimeline } from "@/components/blog/BlogTimeline"
import { SubscriberBadge } from "@/components/blog/SubscriberBadge"
import { BlogCategoryTabs } from "@/components/blog/BlogCategoryTabs"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical writing on AI engineering, fullstack systems, architecture patterns, and engineering productivity.",
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { category?: string }
}) {
  const locale = params.locale ?? "en"
  const t = await getTranslations("blog")
  const posts = getAllPosts(locale)
  const cat = (searchParams.category ?? "all").toLowerCase()
  const filtered =
    cat === "all"
      ? posts
      : posts.filter(
          (p) => (p.frontmatter.category ?? "engineering").toLowerCase() === cat
        )

  return (
    <div className="container-custom py-12 md:py-16">
      <SectionHeader
        label={t("label")}
        title={t("title")}
        description={t("description")}
        align="left"
      />

      <div className="mb-8 rounded-lg border bg-card px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <NewsletterSignup variant="banner" />
          <PushSubscribe />
        </div>
        <Suspense fallback={null}>
          <SubscriberBadge className="mt-2" />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <BlogCategoryTabs />
      </Suspense>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{t("noPostsYet")}</p>
      ) : (
        <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-10">
          <BlogFeed posts={filtered} />
          <BlogTimeline posts={filtered} />
        </div>
      )}
    </div>
  )
}
