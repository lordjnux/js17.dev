"use client"

import { forwardRef } from "react"

interface LegalConsentProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  /** "proposal" shows all 3 docs; "newsletter" shows privacy + habeas only */
  variant?: "proposal" | "newsletter"
}

export const LegalConsent = forwardRef<HTMLInputElement, LegalConsentProps>(
  function LegalConsent({ id = "legal-consent", checked, onChange, error, variant = "proposal" }, ref) {
    return (
      <div className="space-y-1">
        <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className={`h-4 w-4 rounded border transition-colors
              ${checked
                ? "bg-primary border-primary"
                : "bg-background border-input group-hover:border-primary/50"
              } ${error ? "border-destructive" : ""}`}
            >
              {checked && (
                <svg className="h-4 w-4 text-primary-foreground" viewBox="0 0 16 16" fill="none">
                  <path d="M3.5 8L6.5 11L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>

          <span className="text-xs text-muted-foreground leading-relaxed">
            {variant === "proposal" ? (
              <>
                I have read and accept the{" "}
                <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
                  Terms of Service
                </a>
                {", "}
                <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
                  Privacy Policy
                </a>
                {" and "}
                <a href="/legal/habeas-data" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
                  Habeas Data Policy
                </a>
                . I authorise the processing of my personal data to receive a response to this proposal.
              </>
            ) : (
              <>
                I agree to receive newsletter updates and accept the{" "}
                <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
                  Privacy Policy
                </a>
                {" and "}
                <a href="/legal/habeas-data" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
                  Habeas Data Policy
                </a>
                . Unsubscribe at any time.
              </>
            )}
          </span>
        </label>

        {error && (
          <p className="text-xs text-destructive pl-6">{error}</p>
        )}
      </div>
    )
  }
)
