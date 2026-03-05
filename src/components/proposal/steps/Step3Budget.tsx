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
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      currencies: data.budget?.currencies ?? [],
      hourlyRate: data.budget?.hourlyRate ?? "",
      fixedBudget: data.budget?.fixedBudget ?? "",
      flexibility: data.budget?.flexibility ?? "flexible",
    },
  })

  const onSubmit = (values: Step3Data) => {
    onNext({ budget: values })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Budget & Engagement Model</h2>
        <p className="text-sm text-muted-foreground">
          Fill what you know — at least one price type and one currency required.
        </p>
      </div>

      {/* Currency — checkboxes, at least one */}
      <div className="space-y-1.5">
        <Label>Currency <span className="text-muted-foreground font-normal">(select one or both)</span></Label>
        <Controller
          name="currencies"
          control={control}
          render={({ field }) => (
            <div className="flex gap-3">
              {(["USD", "EUR"] as const).map((c) => {
                const selected = field.value?.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? field.value.filter((v) => v !== c)
                        : [...(field.value ?? []), c]
                      field.onChange(next)
                    }}
                    className={cn(
                      "flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-all",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {c === "USD" ? "$ USD" : "€ EUR"}
                  </button>
                )
              })}
            </div>
          )}
        />
        {errors.currencies && (
          <p className="text-xs text-destructive">{errors.currencies.message as string}</p>
        )}
      </div>

      {/* Price fields — show both, fill at least one */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>
            Hourly rate
            <span className="ml-1 text-xs text-muted-foreground font-normal">optional</span>
          </Label>
          <Input
            placeholder="e.g. 120/hr"
            {...register("hourlyRate")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>
            Fixed budget
            <span className="ml-1 text-xs text-muted-foreground font-normal">optional</span>
          </Label>
          <Input
            placeholder="e.g. 5,000 – 10,000"
            {...register("fixedBudget")}
          />
        </div>
      </div>
      {errors.hourlyRate && (
        <p className="text-xs text-destructive -mt-3">{errors.hourlyRate.message}</p>
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
