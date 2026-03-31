"use client"

import { useSearchParams, useRouter } from "next/navigation"

const tabs = [
  { id: "all", label: "All Posts" },
  { id: "engineering", label: "Engineering" },
  { id: "hobbies", label: "Hobbies Stats →", href: "/hobbies" },
]

export function BlogCategoryTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentCategory = searchParams.get("category") ?? "all"

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive =
          tab.href === undefined &&
          (tab.id === "all"
            ? currentCategory === "all" || !currentCategory
            : currentCategory === tab.id)

        if (tab.href) {
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href!)}
              className="rounded-full border border-border/50 px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-orange-500/40 hover:text-orange-400 transition-colors"
            >
              {tab.label}
            </button>
          )
        }

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "all") router.push("/blog")
              else router.push(`/blog?category=${tab.id}`)
            }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                : "border-border/50 text-muted-foreground hover:border-blue-500/30 hover:text-blue-400"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
