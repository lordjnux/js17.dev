"use client"

import { useEffect, useState } from "react"
import { Youtube } from "lucide-react"

interface VideoStatus {
  short: { youtubeUrl: string } | null
  long: { youtubeUrl: string } | null
}

export function ArticleVideos({ slug }: { slug: string }) {
  const [videos, setVideos] = useState<VideoStatus | null>(null)

  useEffect(() => {
    fetch(`/api/blog/article-videos?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data: VideoStatus) => {
        if (data.short || data.long) setVideos(data)
      })
      .catch(() => {})
  }, [slug])

  if (!videos) return null

  return (
    <div className="flex items-center gap-2 mb-6">
      <Youtube className="h-4 w-4 text-red-500 flex-shrink-0" />
      <span className="text-sm text-muted-foreground">Watch on YouTube:</span>
      {videos.short && (
        <a
          href={videos.short.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Short
        </a>
      )}
      {videos.long && (
        <a
          href={videos.long.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Full Video
        </a>
      )}
    </div>
  )
}
