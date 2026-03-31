"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface StravaStatCardProps {
  label: string
  value: string
  subValue?: string
  icon: string
  delay?: number
}

function parseValueParts(str: string): { num: number | null; rest: string } {
  const match = str.match(/^([\d,.]+)(.*)$/)
  if (!match) return { num: null, rest: str }
  return {
    num: parseFloat(match[1].replace(/,/g, "")),
    rest: match[2],
  }
}

function formatNum(n: number, original: string): string {
  // Preserve decimal places from original
  const dotIdx = original.indexOf(".")
  if (dotIdx !== -1) {
    const decimals = original.match(/^[\d,.]+/)?.[0].split(".")[1]?.length ?? 1
    return n.toFixed(decimals)
  }
  return Math.round(n).toString()
}

export function StravaStatCard({
  label,
  value,
  subValue,
  icon,
  delay = 0,
}: StravaStatCardProps) {
  const { num, rest } = parseValueParts(value)
  const [displayed, setDisplayed] = useState(num !== null ? 0 : null)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const duration = 1200

  useEffect(() => {
    if (num === null) return
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(num * eased)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    const delayMs = delay * 1000
    const timer = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate)
    }, delayMs)

    return () => {
      clearTimeout(timer)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      startRef.current = null
    }
  }, [num, delay])

  const displayValue =
    displayed !== null && num !== null
      ? formatNum(displayed, value) + rest
      : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5 flex flex-col gap-2 hover:border-orange-500/40 transition-colors"
    >
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span className="text-lg">{icon}</span>
        <span className="uppercase tracking-wide text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-orange-400 tabular-nums">
        {displayValue}
      </div>
      {subValue && (
        <div className="text-xs text-muted-foreground">{subValue}</div>
      )}
    </motion.div>
  )
}
