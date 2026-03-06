import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { MDXRemote } from "next-mdx-remote/rsc"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const LEGAL_DIR = path.join(process.cwd(), "src/content/legal")
const VALID_DOCS = ["terms", "privacy", "habeas-data"] as const
type DocSlug = (typeof VALID_DOCS)[number]

function readDoc(slug: string) {
  const file = path.join(LEGAL_DIR, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null
  const { data, content } = matter(fs.readFileSync(file, "utf-8"))
  return { meta: data as { title: string; version: string; effective: string; summary: string }, content }
}

export async function generateStaticParams() {
  return VALID_DOCS.map((doc) => ({ doc }))
}

export async function generateMetadata({ params }: { params: { doc: string } }): Promise<Metadata> {
  const doc = readDoc(params.doc)
  if (!doc) return {}
  return {
    title: `${doc.meta.title} — js17.dev`,
    description: doc.meta.summary,
  }
}

export default function LegalPage({ params }: { params: { doc: string } }) {
  if (!VALID_DOCS.includes(params.doc as DocSlug)) notFound()
  const doc = readDoc(params.doc)
  if (!doc) notFound()

  return (
    <main className="min-h-screen py-16 md:py-24">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 pb-8 border-b">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Legal</p>
          <h1 className="text-3xl font-bold mb-3">{doc.meta.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Version {doc.meta.version}</span>
            <span>·</span>
            <span>Effective {new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(doc.meta.effective))}</span>
          </div>
          {doc.meta.summary && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4">
              {doc.meta.summary}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none
          prose-headings:font-semibold prose-headings:text-foreground
          prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-li:text-muted-foreground prose-li:leading-relaxed
          prose-strong:text-foreground
          prose-table:text-sm prose-td:py-2 prose-th:py-2">
          <MDXRemote source={doc.content} />
        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
          <a href="/legal/terms" className="hover:text-primary transition-colors">Terms of Service</a>
          <span>·</span>
          <a href="/legal/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/legal/habeas-data" className="hover:text-primary transition-colors">Habeas Data</a>
        </div>
      </div>
    </main>
  )
}
