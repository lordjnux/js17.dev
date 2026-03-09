import { getAllPosts } from "@/lib/mdx"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { NewsletterSignup } from "@/components/blog/NewsletterSignup"
import { PushSubscribe } from "@/components/blog/PushSubscribe"
import { BlogFeed } from "@/components/blog/BlogFeed"
import { BlogTimeline } from "@/components/blog/BlogTimeline"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical writing on AI engineering, fullstack systems, architecture patterns, and engineering productivity.",
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="container-custom py-12 md:py-16">
      <SectionHeader
        label="Writing"
        title="Blog"
        description="Technical articles on AI engineering, architecture, and building production systems."
        align="left"
      />

      {/* Subscribe strip */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border bg-card px-4 py-3">
        <NewsletterSignup variant="banner" />
        <PushSubscribe />
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts published yet. Check back soon.</p>
      ) : (
        <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-10">
          {/* Main feed — chronological desc, latest on top */}
          <BlogFeed posts={posts} />

          {/* Right sidebar — vertical timeline */}
          <BlogTimeline posts={posts} />
        </div>
      )}
    </div>
  )
}
