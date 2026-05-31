import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { Post, PostFrontmatter } from "@/types/blog"
import { readingTime } from "./utils"

const BLOG_ROOT = path.join(process.cwd(), "src/content/blog")

function getContentDir(locale: string = "en") {
  return path.join(BLOG_ROOT, locale)
}

/** Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" as local time — no ambiguity. */
function parseDateMs(dateStr: string): number {
  const [datePart, timePart] = dateStr.split("T")
  const [y, m, d] = datePart.split("-").map(Number)
  if (timePart) {
    const [h, min] = timePart.split(":").map(Number)
    return new Date(y, m - 1, d, h, min).getTime()
  }
  return new Date(y, m - 1, d).getTime()
}

export function getAllPosts(locale: string = "en"): Post[] {
  const dir = getContentDir(locale)

  // Fall back to 'en' dir if locale dir doesn't exist
  const effectiveDir = fs.existsSync(dir) ? dir : getContentDir("en")

  if (!fs.existsSync(effectiveDir)) return []

  const files = fs.readdirSync(effectiveDir).filter((f) => f.endsWith(".mdx"))

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "")
    const filePath = path.join(effectiveDir, file)
    const raw = fs.readFileSync(filePath, "utf-8")
    const { data, content } = matter(raw)
    const frontmatter = data as PostFrontmatter

    return {
      slug,
      frontmatter,
      content,
      excerpt: content.slice(0, 200).replace(/[#*`]/g, "").trim() + "...",
      isFallback: effectiveDir !== dir,
    }
  })

  return posts
    .filter((p) => p.frontmatter.published)
    .sort((a, b) => parseDateMs(b.frontmatter.date) - parseDateMs(a.frontmatter.date))
    .map((p) => ({
      ...p,
      frontmatter: {
        ...p.frontmatter,
        readingTime: readingTime(p.content),
      },
    }))
}

export function getPostBySlug(slug: string, locale: string = "en"): Post | null {
  const localeDir = getContentDir(locale)
  const localePath = path.join(localeDir, `${slug}.mdx`)

  // Try locale-specific file first
  if (fs.existsSync(localePath)) {
    const raw = fs.readFileSync(localePath, "utf-8")
    const { data, content } = matter(raw)
    const frontmatter = data as PostFrontmatter
    return {
      slug,
      frontmatter: { ...frontmatter, readingTime: readingTime(content) },
      content,
      excerpt: content.slice(0, 200).replace(/[#*`]/g, "").trim() + "...",
      isFallback: false,
    }
  }

  // Fall back to English if locale is not 'en'
  if (locale !== "en") {
    const enPath = path.join(getContentDir("en"), `${slug}.mdx`)
    if (fs.existsSync(enPath)) {
      const raw = fs.readFileSync(enPath, "utf-8")
      const { data, content } = matter(raw)
      const frontmatter = data as PostFrontmatter
      return {
        slug,
        frontmatter: { ...frontmatter, readingTime: readingTime(content) },
        content,
        excerpt: content.slice(0, 200).replace(/[#*`]/g, "").trim() + "...",
        isFallback: true,
      }
    }
  }

  return null
}

export function generateLinkedInText(post: Post): string {
  const { title, description, tags, date } = post.frontmatter
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev"}/blog/${post.slug}`
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
  }).format(new Date(parseDateMs(date)))

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
