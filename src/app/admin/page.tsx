export const dynamic = 'force-dynamic'

import { getAdminToken } from "@/lib/server-auth"
import { redirect } from "next/navigation"
import { list } from "@vercel/blob"
import Link from "next/link"
import { getAllPosts } from "@/lib/mdx"
import { BlogPostsPanel } from "@/components/admin/BlogPostsPanel"
import { YouTubeMetricsChart } from "@/components/admin/YouTubeMetricsChart"
import { NewsletterSentPanel } from "@/components/admin/NewsletterSentPanel"
import { FileText, Users, Youtube, Mail, ShieldCheck, LayoutDashboard, Globe } from "lucide-react"

async function getNewsletterStatus() {
  try {
    const [subBlob, sentBlob] = await Promise.allSettled([
      list({ prefix: "newsletter/subscribers.json" }),
      list({ prefix: "newsletter/sent-posts.json" }),
    ])
    let subscriberCount = 0
    let sentSlugs: string[] = []
    if (subBlob.status === "fulfilled" && subBlob.value.blobs.length > 0) {
      const res = await fetch(subBlob.value.blobs[0].url, { cache: "no-store" })
      const data = await res.json()
      const subscribers = Array.isArray(data) ? data : (data.subscribers ?? [])
      subscriberCount = subscribers.filter((s: { confirmed?: boolean }) => s.confirmed !== false).length
    }
    if (sentBlob.status === "fulfilled" && sentBlob.value.blobs.length > 0) {
      const res = await fetch(sentBlob.value.blobs[0].url, { cache: "no-store" })
      const data = await res.json()
      sentSlugs = Array.isArray(data) ? data : (data.slugs ?? data.posts ?? [])
    }
    return { subscriberCount, sentSlugs }
  } catch {
    return { subscriberCount: 0, sentSlugs: [] }
  }
}

async function getYouTubeTotals() {
  try {
    const { blobs } = await list({ prefix: "youtube/metrics-cache.json" })
    if (blobs.length === 0) return { views: 0, videos: 0 }
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    const data = await res.json()
    return { views: data.totals?.views ?? 0, videos: data.totals?.videos ?? 0 }
  } catch {
    return { views: 0, videos: 0 }
  }
}

export default async function AdminPage() {
  const token = await getAdminToken()
  if (!token) {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  const posts = getAllPosts("en")
  const [newsletter, youtube] = await Promise.all([getNewsletterStatus(), getYouTubeTotals()])
  const publishedPosts = posts.filter((p) => p.frontmatter.published)

  const firstName = (token.name as string | undefined)?.split(" ")[0] ?? "Admin"

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome back, {firstName}. Here&apos;s an overview of js17.dev.
          </p>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/admin/submissions"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Moderation
          </Link>
          <Link
            href="/admin/youtube"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Youtube className="h-3.5 w-3.5" />
            YouTube
          </Link>
          <Link
            href="/admin/social"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            Social
          </Link>
        </nav>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Posts</p>
          </div>
          <p className="text-3xl font-bold">{posts.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{publishedPosts.length} published</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-4 w-4 text-blue-500" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subscribers</p>
          </div>
          <p className="text-3xl font-bold">{newsletter.subscriberCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{newsletter.sentSlugs.length} posts notified</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="h-4 w-4 text-red-500" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">YT Videos</p>
          </div>
          <p className="text-3xl font-bold">{youtube.videos}</p>
          <p className="text-xs text-muted-foreground mt-1">published</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-green-500" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">YT Views</p>
          </div>
          <p className="text-3xl font-bold">{youtube.views.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">total (cached)</p>
        </div>
      </div>

      {/* Blog Posts Panel */}
      <BlogPostsPanel posts={posts} sentSlugs={newsletter.sentSlugs} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YouTubeMetricsChart />
        <NewsletterSentPanel
          subscriberCount={newsletter.subscriberCount}
          sentSlugs={newsletter.sentSlugs}
          totalPosts={posts.length}
        />
      </div>
    </main>
  )
}
