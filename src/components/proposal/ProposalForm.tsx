"use client"

import { useEffect, useRef } from "react"
import { useProposalForm } from "@/hooks/useProposalForm"
import { FormProgress } from "./FormProgress"
import { Step1ClientInfo } from "./steps/Step1ClientInfo"
import { Step2ProjectDetails } from "./steps/Step2ProjectDetails"
import { Step3Budget } from "./steps/Step3Budget"
import { Step4Contact } from "./steps/Step4Contact"
import { Step5Schedule } from "./steps/Step5Schedule"
import { ProposalSuccess } from "./ProposalSuccess"
import { ProposalFormData } from "@/types/proposal"
import { SITE_CONFIG } from "@/lib/constants"

// Preload Cal.com embed script as soon as step 3 is reached so it is ready
// by the time the user arrives at step 5.
function useCalPreloader(step: number) {
  const loaded = useRef(false)

  useEffect(() => {
    if (step < 3 || loaded.current) return
    // @ts-expect-error Cal embed global
    if (window.Cal) { loaded.current = true; return }

    const script = document.createElement("script")
    script.src = "https://app.cal.com/embed/embed.js"
    script.async = true
    script.onload = () => { loaded.current = true }
    document.head.appendChild(script)

    return () => {
      // Only remove if we added it and step 5 hasn't mounted yet (cleanup on unmount)
      if (!loaded.current) document.head.removeChild(script)
    }
  }, [step])
}

export function ProposalForm() {
  const { step, data, updateData, nextStep, prevStep, submit, isSubmitting, isSuccess, error } =
    useProposalForm()

  // Start warming up Cal.com from step 3 onward
  useCalPreloader(step)

  if (isSuccess) return <ProposalSuccess />

  const handleNext = (update: Partial<ProposalFormData>) => {
    updateData(update)
    nextStep()
  }

  const calUsername = SITE_CONFIG.calcom.username
  const calEventType = SITE_CONFIG.calcom.eventType

  return (
    <div>
      <FormProgress currentStep={step} />

      <div className="bg-card rounded-xl border p-6 md:p-8">
        {step === 1 && <Step1ClientInfo data={data} onNext={handleNext} />}
        {step === 2 && <Step2ProjectDetails data={data} onNext={handleNext} onBack={prevStep} />}
        {step === 3 && <Step3Budget data={data} onNext={handleNext} onBack={prevStep} />}
        {step === 4 && <Step4Contact data={data} onNext={handleNext} onBack={prevStep} />}
        {step === 5 && (
          <Step5Schedule
            onBack={prevStep}
            onSubmit={submit}
            isSubmitting={isSubmitting}
            error={error}
            calUsername={calUsername}
            calEventType={calEventType}
          />
        )}
      </div>
    </div>
  )
}
