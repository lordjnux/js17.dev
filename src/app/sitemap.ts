import { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/mdx"
import { SITE_CONFIG } from "@/lib/constants"

export default function sitemap(): MetadataRoute.Sitemap {
  const enPosts = getAllPosts("en")
  const baseUrl = SITE_CONFIG.url

  const staticEn: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/hobbies`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/changelog`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/proposal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/jack`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ]

  const staticEs: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/es`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/es/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/es/hobbies`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/es/changelog`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/es/proposal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/es/jack`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ]

  const postRoutesEn: MetadataRoute.Sitemap = enPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const postRoutesEs: MetadataRoute.Sitemap = enPosts.map((post) => ({
    url: `${baseUrl}/es/blog/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticEn, ...staticEs, ...postRoutesEn, ...postRoutesEs]
}
