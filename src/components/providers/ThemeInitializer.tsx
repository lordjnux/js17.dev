"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

const ALL_THEMES = ["light", "dark", "titanium", "aurora"]
const VISITED_KEY = "js17-visited"
const FIRST_VISIT_THEME = "dark"

/**
 * ThemeInitializer — sets theme based on visit history.
 * First visit → Forest Node (brand default).
 * Returning visits → random palette from the full set.
 *
 * Runs client-side only, after mount.
 */
export function ThemeInitializer() {
  const { setTheme } = useTheme()

  useEffect(() => {
    const hasVisited = localStorage.getItem(VISITED_KEY)

    if (!hasVisited) {
      setTheme(FIRST_VISIT_THEME)
      localStorage.setItem(VISITED_KEY, "1")
    } else {
      const random = ALL_THEMES[Math.floor(Math.random() * ALL_THEMES.length)]
      setTheme(random)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
