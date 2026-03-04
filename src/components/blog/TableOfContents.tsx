"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: "0% 0% -80% 0%" }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (!headings.length) return null

  return (
    <nav aria-label="Table of contents" className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        On this page
      </p>
      {headings.map(({ id, text, level }) => (
        <a
          key={id}
          href={`#${id}`}
          className={cn(
            "block text-sm py-1 transition-colors leading-snug",
            level === 3 ? "pl-4" : level === 4 ? "pl-8" : "pl-0",
            activeId === id
              ? "text-blue-500 font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {text}
        </a>
      ))}
    </nav>
  )
}
