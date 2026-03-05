"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Check, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"

const THEMES = [
  {
    id: "dark",
    label: "Circuit Dark",
    description: "Deep navy · Electric blue",
    swatches: ["#0B0F1A", "#3B82F6"],
  },
  {
    id: "light",
    label: "Circuit Light",
    description: "Clean white · Electric blue",
    swatches: ["#FFFFFF", "#3B82F6"],
  },
  {
    id: "terminal",
    label: "Terminal",
    description: "Void black · Phosphor green",
    swatches: ["#0A0A0A", "#00CC33"],
  },
  {
    id: "plasma",
    label: "Plasma",
    description: "Deep space · Vivid violet",
    swatches: ["#0D0720", "#A855F7"],
  },
  {
    id: "titanium",
    label: "Titanium",
    description: "Warm charcoal · Amber gold",
    swatches: ["#111110", "#F59E0B"],
  },
  {
    id: "forest",
    label: "Forest Node",
    description: "Dark emerald · Circuit green",
    swatches: ["#071210", "#10B981"],
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Arctic teal · Electric cyan",
    swatches: ["#060F14", "#06B6D4"],
  },
] as const

export function ThemePicker() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9" aria-label="Select theme">
        <Palette className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Select color theme"
        aria-expanded={open}
      >
        {/* Live swatch dot showing current primary */}
        <span
          className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full ring-1 ring-background"
          style={{ backgroundColor: current.swatches[1] }}
        />
        <Palette className="h-4 w-4" />
      </Button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-11 z-50 w-64 rounded-xl border bg-popover shadow-xl",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
          )}
          role="listbox"
          aria-label="Color themes"
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <Palette className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Color Theme
            </span>
          </div>

          {/* Theme list */}
          <div className="p-1.5">
            {THEMES.map((t) => {
              const active = theme === t.id
              return (
                <button
                  key={t.id}
                  role="option"
                  aria-selected={active}
                  onClick={() => { setTheme(t.id); setOpen(false) }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/60 text-popover-foreground"
                  )}
                >
                  {/* Swatches */}
                  <span className="flex gap-0.5 shrink-0">
                    <span
                      className="h-5 w-5 rounded-l-md border border-border/50"
                      style={{ backgroundColor: t.swatches[0] }}
                    />
                    <span
                      className="h-5 w-5 rounded-r-md border border-border/50"
                      style={{ backgroundColor: t.swatches[1] }}
                    />
                  </span>

                  {/* Label */}
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium leading-tight">{t.label}</span>
                    <span className="block text-xs text-muted-foreground truncate">{t.description}</span>
                  </span>

                  {/* Active check */}
                  {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
