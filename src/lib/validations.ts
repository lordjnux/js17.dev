import { z } from "zod"

export const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name is required"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
})

export const step2Schema = z.object({
  title: z.string().min(5, "Project title must be at least 5 characters"),
  description: z
    .string()
    .min(20, "Please describe your project (min 20 characters)")
    .max(2000, "Max 2000 characters"),
  type: z.enum(["web-app", "mobile", "ai-integration", "api", "consulting", "other"]),
  timeline: z.enum(["1-2 weeks", "1 month", "2-3 months", "3-6 months", "6+ months"]),
  features: z.array(z.string()).min(1, "Add at least one key feature"),
})

export const step3Schema = z.object({
  model: z.enum(["hourly", "fixed"]),
  currency: z.enum(["USD", "EUR"]),
  hourlyRate: z.number().positive().optional(),
  estimatedHours: z.number().positive().optional(),
  fixedBudget: z.string().optional(),
  flexibility: z.enum(["exact", "flexible", "tbd"]),
})

export const step4Schema = z.object({
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  timezone: z.string().min(1, "Please select your timezone"),
  preferredContact: z.enum(["email", "video", "whatsapp"]),
  additionalNotes: z.string().max(1000).optional(),
})

export const proposalSchema = z.object({
  client: step1Schema,
  project: step2Schema,
  budget: step3Schema,
  contact: step4Schema,
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type ProposalData = z.infer<typeof proposalSchema>
