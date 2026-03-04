"use client"

import { useProposalForm } from "@/hooks/useProposalForm"
import { FormProgress } from "./FormProgress"
import { Step1ClientInfo } from "./steps/Step1ClientInfo"
import { Step2ProjectDetails } from "./steps/Step2ProjectDetails"
import { Step3Budget } from "./steps/Step3Budget"
import { Step4Contact } from "./steps/Step4Contact"
import { Step5Schedule } from "./steps/Step5Schedule"
import { ProposalSuccess } from "./ProposalSuccess"
import { ProposalFormData } from "@/types/proposal"

export function ProposalForm() {
  const { step, data, updateData, nextStep, prevStep, submit, isSubmitting, isSuccess, error } =
    useProposalForm()

  if (isSuccess) return <ProposalSuccess />

  const handleNext = (update: Partial<ProposalFormData>) => {
    updateData(update)
    nextStep()
  }

  return (
    <div>
      <FormProgress currentStep={step} />

      <div className="bg-card rounded-xl border p-6 md:p-8">
        {step === 1 && <Step1ClientInfo data={data} onNext={handleNext} />}
        {step === 2 && <Step2ProjectDetails data={data} onNext={handleNext} onBack={prevStep} />}
        {step === 3 && <Step3Budget data={data} onNext={handleNext} onBack={prevStep} />}
        {step === 4 && <Step4Contact data={data} onNext={handleNext} onBack={prevStep} />}
        {step === 5 && (
          <Step5Schedule onBack={prevStep} onSubmit={submit} isSubmitting={isSubmitting} error={error} />
        )}
      </div>
    </div>
  )
}
