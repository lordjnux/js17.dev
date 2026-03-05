import { notFound } from "next/navigation"
import { getAllPosts, getPostBySlug, generateLinkedInText } from "@/lib/mdx"
import { PostHeader } from "@/components/blog/PostHeader"
import { TableOfContents } from "@/components/blog/TableOfContents"
import { CopyForLinkedIn } from "@/components/blog/CopyForLinkedIn"
import type { Metadata } from "next"
import { compileMDX } from "next-mdx-remote/rsc"
import {
  Callout,
  StatRow, StatCard,
  StackGrid, StackItem,
  Timeline, TimelineStep,
  IterationBars, IterationBar,
  SkillSection, SkillCategory,
  ChallengeCard,
  CTABlock,
} from "@/components/blog/MDXContent"

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: "article",
      publishedTime: post.frontmatter.date,
      authors: [post.frontmatter.author || "Jeroham Sanchez"],
      tags: post.frontmatter.tags,
    },
  }
}

function extractHeadings(content: string) {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  const headings: { id: string; text: string; level: number }[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s]+/g, "-")
    headings.push({ id, text, level: match[1].length })
  }

  return headings
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const headings = extractHeadings(post.content)
  const linkedInText = generateLinkedInText(post)

  // Parse MDX
  const { content } = await compileMDX({
    source: post.content,
    options: { parseFrontmatter: false },
    components: {
      Callout,
      StatRow, StatCard,
      StackGrid, StackItem,
      Timeline, TimelineStep,
      IterationBars, IterationBar,
      SkillSection, SkillCategory,
      ChallengeCard,
      CTABlock,
    },
  })

  return (
    <div className="container-custom py-12 md:py-16">
      <div className="flex gap-12 justify-between">
        {/* Main content */}
        <article className="min-w-0 flex-1 max-w-3xl">
          <PostHeader frontmatter={post.frontmatter} />

          <div className="flex justify-end mb-8">
            <CopyForLinkedIn text={linkedInText} />
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:p-0 prose-pre:bg-transparent">
            {content}
          </div>
        </article>

        {/* TOC sidebar */}
        {headings.length > 0 && (
          <aside className="hidden xl:block w-56 flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-auto">
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>
    </div>
  )
}
