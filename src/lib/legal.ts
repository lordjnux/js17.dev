// Single source of truth for current legal document versions.
// Bump a version here when that document changes — old versions
// remain accessible via /legal/[doc]?v=X.X

export const LEGAL_VERSIONS = {
  terms:   { version: "1.0", effective: "2026-03-06" },
  privacy: { version: "1.0", effective: "2026-03-06" },
  habeas:  { version: "1.0", effective: "2026-03-06" },
} as const

export type LegalDoc = keyof typeof LEGAL_VERSIONS

export function legalVersionString(): string {
  return `terms-v${LEGAL_VERSIONS.terms.version}|privacy-v${LEGAL_VERSIONS.privacy.version}|habeas-v${LEGAL_VERSIONS.habeas.version}`
}
