"use client"

import { useState } from "react"
import { ProposalFormData, ProposalStep } from "@/types/proposal"

const INITIAL_DATA: ProposalFormData = {
  client: { name: "", company: "", website: "" },
  project: {
    title: "",
    description: "",
    type: "web-app",
    timeline: "1 month",
    features: [],
  },
  budget: {
    model: "hourly",
    currency: "USD",
    hourlyRate: undefined,
    estimatedHours: undefined,
    fixedBudget: "",
    flexibility: "flexible",
  },
  contact: {
    email: "",
    phone: "",
    timezone: "",
    preferredContact: "email",
    additionalNotes: "",
  },
}

export function useProposalForm() {
  const [step, setStep] = useState<ProposalStep>(1)
  const [data, setData] = useState<ProposalFormData>(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateData(update: Partial<ProposalFormData>) {
    setData((prev) => ({ ...prev, ...update }))
  }

  function nextStep() {
    if (step < 5) setStep((s) => (s + 1) as ProposalStep)
  }

  function prevStep() {
    if (step > 1) setStep((s) => (s - 1) as ProposalStep)
  }

  async function submit() {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Submission failed")
      }
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return { step, data, updateData, nextStep, prevStep, submit, isSubmitting, isSuccess, error }
}
