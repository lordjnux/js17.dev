import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { Post, PostFrontmatter } from "@/types/blog"
import { readingTime } from "./utils"

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog")

export function getAllPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"))

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "")
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8")
    const { data, content } = matter(raw)
    const frontmatter = data as PostFrontmatter

    return {
      slug,
      frontmatter,
      content,
      excerpt: content.slice(0, 200).replace(/[#*`]/g, "").trim() + "...",
    }
  })

  return posts
    .filter((p) => p.frontmatter.published)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    )
    .map((p) => ({
      ...p,
      frontmatter: {
        ...p.frontmatter,
        readingTime: readingTime(p.content),
      },
    }))
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)
  const frontmatter = data as PostFrontmatter

  return {
    slug,
    frontmatter: {
      ...frontmatter,
      readingTime: readingTime(content),
    },
    content,
    excerpt: content.slice(0, 200).replace(/[#*`]/g, "").trim() + "...",
  }
}

export function generateLinkedInText(post: Post): string {
  const { title, description, tags, date } = post.frontmatter
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev"}/blog/${post.slug}`
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
  }).format(new Date(date))

  const hashtags = tags
    .slice(0, 5)
    .map((t) => `#${t.replace(/\s+/g, "")}`)
    .join(" ")

  return `🚀 New article: ${title}

${description}

📖 Read the full post: ${url}

Written in ${formattedDate}

${hashtags} #engineering #softwareengineering #ai`
}
