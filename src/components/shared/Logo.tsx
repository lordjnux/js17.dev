import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
}

/**
 * LogoMark — the circuit tree icon only.
 * Uses currentColor so it adapts to any palette/theme automatically.
 */
export function LogoMark({ className, size = 28 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="150 145 200 215"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <g stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none">
        {/* Central trunk */}
        <line x1="250" y1="200" x2="250" y2="350" />
        {/* Top branches */}
        <path d="M250 240 L170 170" />
        <path d="M250 240 L330 170" />
        {/* Mid branches */}
        <path d="M250 275 L185 220" />
        <path d="M250 275 L315 220" />
        {/* Lower branches */}
        <path d="M250 310 L200 270" />
        <path d="M250 310 L300 270" />
        {/* Node dots — strokeWidth tighter for the small circles */}
        <circle cx="170" cy="170" r="7" strokeWidth="4" />
        <circle cx="330" cy="170" r="7" strokeWidth="4" />
        <circle cx="185" cy="220" r="7" strokeWidth="4" />
        <circle cx="315" cy="220" r="7" strokeWidth="4" />
        <circle cx="200" cy="270" r="7" strokeWidth="4" />
        <circle cx="300" cy="270" r="7" strokeWidth="4" />
      </g>
    </svg>
  )
}

/**
 * LogoFull — circuit tree mark + JS17 wordmark.
 * Used in footer, OG contexts, and any full-brand placement.
 */
export function LogoFull({ className, size = 80 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="JS17 logo"
      className={cn("shrink-0", className)}
    >
      <g stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none">
        <line x1="250" y1="200" x2="250" y2="350" />
        <path d="M250 240 L170 170" />
        <path d="M250 240 L330 170" />
        <path d="M250 275 L185 220" />
        <path d="M250 275 L315 220" />
        <path d="M250 310 L200 270" />
        <path d="M250 310 L300 270" />
        <circle cx="170" cy="170" r="7" strokeWidth="4" />
        <circle cx="330" cy="170" r="7" strokeWidth="4" />
        <circle cx="185" cy="220" r="7" strokeWidth="4" />
        <circle cx="315" cy="220" r="7" strokeWidth="4" />
        <circle cx="200" cy="270" r="7" strokeWidth="4" />
        <circle cx="300" cy="270" r="7" strokeWidth="4" />
      </g>
      <text
        x="250"
        y="445"
        fontFamily="Arial, sans-serif"
        fontSize="80"
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        JS17
      </text>
    </svg>
  )
}
