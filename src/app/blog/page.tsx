import { getAllPosts } from "@/lib/mdx"
import { PostCard } from "@/components/blog/PostCard"
import { SectionHeader } from "@/components/shared/SectionHeader"
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

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts published yet. Check back soon.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
