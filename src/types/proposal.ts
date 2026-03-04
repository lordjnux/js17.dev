export interface ClientInfo {
  name: string
  company: string
  website?: string
}

export interface ProjectDetails {
  title: string
  description: string
  type: "web-app" | "mobile" | "ai-integration" | "api" | "consulting" | "other"
  timeline: "1-2 weeks" | "1 month" | "2-3 months" | "3-6 months" | "6+ months"
  features: string[]
}

export interface BudgetInfo {
  model: "hourly" | "fixed"
  currency: "USD" | "EUR"
  hourlyRate?: number
  estimatedHours?: number
  fixedBudget?: string
  flexibility: "exact" | "flexible" | "tbd"
}

export interface ContactInfo {
  email: string
  phone?: string
  timezone: string
  preferredContact: "email" | "video" | "whatsapp"
  additionalNotes?: string
}

export interface ProposalFormData {
  client: ClientInfo
  project: ProjectDetails
  budget: BudgetInfo
  contact: ContactInfo
}

export type ProposalStep = 1 | 2 | 3 | 4 | 5
