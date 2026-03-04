"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SITE_CONFIG } from "@/lib/constants"

interface CVDownloadButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "xl"
  className?: string
}

export function CVDownloadButton({
  variant = "outline",
  size = "default",
  className,
}: CVDownloadButtonProps) {
  return (
    <Button variant={variant} size={size} className={className} asChild>
      <a
        href={SITE_CONFIG.cvUrl}
        download="CV-JEROHAM-SANCHEZ-SR-FULLSTACK-ENGINEER.pdf"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Download className="mr-2 h-4 w-4" />
        Download CV
      </a>
    </Button>
  )
}
