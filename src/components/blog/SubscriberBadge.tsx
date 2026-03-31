import { list } from "@vercel/blob"

async function getSubscriberCount(): Promise<number> {
  try {
    const { blobs } = await list({ prefix: "newsletter/subscribers.json" })
    if (blobs.length === 0) return 0
    const res = await fetch(blobs[0].url, { next: { revalidate: 3600 } })
    const data = await res.json()
    return Array.isArray(data) ? data.length : 0
  } catch {
    return 0
  }
}

function formatCount(count: number): string {
  const rounded = Math.floor(count / 10) * 10
  return `${rounded}+`
}

export async function SubscriberBadge({ className }: { className?: string }) {
  const count = await getSubscriberCount()
  if (count < 100) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground ${className ?? ""}`}
    >
      <span aria-hidden="true">👥</span>
      <span className="gradient-text font-semibold">{formatCount(count)}</span>
      <span>subscribers</span>
    </span>
  )
}
