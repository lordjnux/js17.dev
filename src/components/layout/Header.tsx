"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CVDownloadButton } from "@/components/shared/CVDownloadButton"
import { LogoMark } from "@/components/shared/Logo"
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Menu, X, Github, Linkedin, ShieldCheck, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher"

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.isAdmin === true
  const t = useTranslations("nav")

  const navLabels: Record<string, string> = {
    Jack: t("jack"),
    Blog: t("blog"),
    Hobbies: t("hobbies"),
    Changelog: t("changelog"),
    Proposal: t("proposal"),
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-200",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md shadow-sm"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight hover:text-primary transition-colors group"
        >
          <LogoMark size={26} className="text-primary transition-colors" />
          <span className="font-mono text-foreground">js17</span>
          <span className="text-muted-foreground font-mono">.dev</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === item.href || pathname.endsWith(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {navLabels[item.label] ?? item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href={SITE_CONFIG.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex text-muted-foreground hover:text-foreground transition-colors p-1.5"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
          <Link
            href={SITE_CONFIG.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex text-muted-foreground hover:text-foreground transition-colors p-1.5"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </Link>
          <CVDownloadButton size="sm" className="hidden md:inline-flex" />
          {status !== "loading" && (
            isAdmin ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-green-500 hover:text-green-400 transition-colors px-2 py-1 rounded-md border border-green-500/20 hover:border-green-500/40"
                  title="Go to admin dashboard"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden md:inline-flex text-muted-foreground hover:text-foreground transition-colors p-1.5"
                aria-label="Admin sign in"
                title="Admin sign in"
              >
                <Lock className="h-3.5 w-3.5" />
              </Link>
            )
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-md">
          <nav className="container-custom flex flex-col gap-1 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  pathname === item.href || pathname.endsWith(item.href) ? "bg-accent" : ""
                )}
                onClick={() => setMobileOpen(false)}
              >
                {navLabels[item.label] ?? item.label}
              </Link>
            ))}
            <div className="pt-2 flex items-center justify-between">
              <CVDownloadButton className="flex-1" />
              <div className="ml-2">
                <LanguageSwitcher />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
