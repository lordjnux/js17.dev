import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  label?: string
  title: string
  description?: string | React.ReactNode
  className?: string
  align?: "left" | "center"
}

import React from "react"

export function SectionHeader({
  label,
  title,
  description,
  className,
  align = "center",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {label && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
          {label}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 max-w-2xl text-muted-foreground sm:text-lg mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}
