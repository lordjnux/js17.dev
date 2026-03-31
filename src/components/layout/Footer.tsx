import Link from "next/link"
import { LogoFull } from "@/components/shared/Logo"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container-custom py-10 flex flex-col items-center gap-2">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="js17.dev home"
        >
          <LogoFull size={48} />
        </Link>
        <p className="text-xs text-muted-foreground">
          © {year} Jeroham Sanchez. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
