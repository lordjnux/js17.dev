import Link from "next/link"
import { Github, Linkedin } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container-custom py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <Link
            href="/"
            className="font-mono font-bold text-sm text-blue-500 hover:text-blue-400 transition-colors"
          >
            js17.dev
          </Link>
          <p className="text-xs text-muted-foreground">
            © {year} Jeroham Sanchez. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={SITE_CONFIG.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href={SITE_CONFIG.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
