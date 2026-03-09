import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  let dateObj: Date
  const hasTime = typeof date === "string" && date.includes("T")

  if (typeof date === "string") {
    if (hasTime) {
      const [datePart, timePart] = date.split("T")
      const [y, m, d] = datePart.split("-").map(Number)
      const [h, min] = timePart.split(":").map(Number)
      dateObj = new Date(y, m - 1, d, h, min)
    } else {
      const [y, m, d] = date.split("-").map(Number)
      dateObj = new Date(y, m - 1, d)
    }
  } else {
    dateObj = date
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj)

  if (!hasTime) return formattedDate

  const h = dateObj.getHours()
  const min = dateObj.getMinutes()
  return `${formattedDate} · ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k"
  }
  return num.toString()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function readingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
