import { SITE_CONFIG } from "@/lib/constants"

export function PersonJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jeroham Sanchez",
    url: SITE_CONFIG.url,
    sameAs: [SITE_CONFIG.github, SITE_CONFIG.linkedin],
    jobTitle: "Senior AI-Augmented Fullstack Systems Engineer",
    description: SITE_CONFIG.description,
    knowsAbout: ["TypeScript", "Next.js", "AI engineering", "RAG systems", "Node.js", "PostgreSQL", "Docker", "React"],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BlogPostingJsonLdProps {
  title: string
  description: string
  date: string
  slug: string
  author?: string
}

export function BlogPostingJsonLd({ title, description, date, slug, author }: BlogPostingJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: date,
    author: {
      "@type": "Person",
      name: author || "Jeroham Sanchez",
      url: SITE_CONFIG.url,
    },
    publisher: {
      "@type": "Person",
      name: "Jeroham Sanchez",
      url: SITE_CONFIG.url,
    },
    url: `${SITE_CONFIG.url}/blog/${slug}`,
    mainEntityOfPage: `${SITE_CONFIG.url}/blog/${slug}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
