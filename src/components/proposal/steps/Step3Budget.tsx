"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step3Schema, Step3Data } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProposalFormData } from "@/types/proposal"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepProps {
  data: ProposalFormData
  onNext: (update: Partial<ProposalFormData>) => void
  onBack: () => void
}

export function Step3Budget({ data, onNext, onBack }: StepProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: {},
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: data.budget,
  })

  const model = watch("model")
  const currency = watch("currency")

  const onSubmit = (values: Step3Data) => {
    onNext({ budget: values })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Budget & Engagement Model</h2>
        <p className="text-sm text-muted-foreground">Choose how you&apos;d like to structure this engagement.</p>
      </div>

      {/* Hourly vs Fixed toggle */}
      <div className="space-y-1.5">
        <Label>Engagement model *</Label>
        <div className="grid grid-cols-2 gap-3">
          {(["hourly", "fixed"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setValue("model", m)}
              className={cn(
                "rounded-lg border p-4 text-left transition-all",
                model === m
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-border hover:border-blue-500/50"
              )}
            >
              <p className="font-medium capitalize">{m}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {m === "hourly"
                  ? "Pay by the hour. Best for ongoing work."
                  : "Fixed price for defined scope."}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="space-y-1.5">
        <Label>Currency *</Label>
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <div className="flex gap-3">
              {(["USD", "EUR"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => field.onChange(c)}
                  className={cn(
                    "flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-all",
                    field.value === c
                      ? "border-blue-500 bg-blue-500/10 text-blue-500"
                      : "border-border hover:border-blue-500/50"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* Hourly fields */}
      {model === "hourly" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Rate (per hour)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {currency === "USD" ? "$" : "€"}
              </span>
              <Input
                type="number"
                className="pl-7"
                placeholder="150"
                {...register("hourlyRate", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Estimated hours</Label>
            <Input
              type="number"
              placeholder="40"
              {...register("estimatedHours", { valueAsNumber: true })}
            />
          </div>
        </div>
      )}

      {/* Fixed fields */}
      {model === "fixed" && (
        <div className="space-y-1.5">
          <Label>Budget range</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currency === "USD" ? "$" : "€"}
            </span>
            <Input
              className="pl-7"
              placeholder="5,000 – 10,000"
              {...register("fixedBudget")}
            />
          </div>
        </div>
      )}

      {/* Flexibility */}
      <div className="space-y-1.5">
        <Label>Budget flexibility</Label>
        <Controller
          name="flexibility"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exact">Fixed — no wiggle room</SelectItem>
                <SelectItem value="flexible">Flexible — ±20% is fine</SelectItem>
                <SelectItem value="tbd">TBD — let&apos;s discuss</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button type="submit" className="gap-2">
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
