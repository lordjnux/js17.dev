import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface FormProgressProps {
  currentStep: number
}

const STEP_LABELS = ["Client", "Project", "Budget", "Contact", "Schedule"]

export function FormProgress({ currentStep }: FormProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {STEP_LABELS.map((label, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep

          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 transition-colors",
                      stepNum <= currentStep ? "bg-blue-500" : "bg-border"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-all flex-shrink-0",
                    isCompleted
                      ? "border-blue-500 bg-blue-500 text-white"
                      : isActive
                      ? "border-blue-500 bg-background text-blue-500"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                </div>
                {index < STEP_LABELS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 transition-colors",
                      stepNum < currentStep ? "bg-blue-500" : "bg-border"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-xs font-medium hidden sm:block",
                  isActive ? "text-blue-500" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
