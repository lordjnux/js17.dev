import fs from "fs"
import path from "path"
import matter from "gray-matter"

const CHANGELOG_DIR = path.join(process.cwd(), "src/content/changelog")

export type ChangelogCategory = "launch" | "feature" | "infrastructure" | "security" | "fix"

export interface ChangelogEntry {
  slug: string
  version: string
  date: string
  title: string
  headline: string
  category: ChangelogCategory
  skills: string[]
  clientValue: string
  devNotes: string
  content: string
}

export function getAllChangelog(): ChangelogEntry[] {
  if (!fs.existsSync(CHANGELOG_DIR)) return []

  const files = fs.readdirSync(CHANGELOG_DIR).filter((f) => f.endsWith(".mdx"))

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "")
      const raw = fs.readFileSync(path.join(CHANGELOG_DIR, file), "utf-8")
      const { data, content } = matter(raw)
      return { slug, ...data, content } as ChangelogEntry
    })
    .sort((a, b) => {
      // Sort by semver descending
      const [aMaj, aMin, aPat] = a.version.split(".").map(Number)
      const [bMaj, bMin, bPat] = b.version.split(".").map(Number)
      return bMaj - aMaj || bMin - aMin || bPat - aPat
    })
}
