"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step1Schema, Step1Data } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProposalFormData } from "@/types/proposal"
import { ArrowRight } from "lucide-react"

interface StepProps {
  data: ProposalFormData
  onNext: (update: Partial<ProposalFormData>) => void
}

export function Step1ClientInfo({ data, onNext }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: data.client,
  })

  const onSubmit = (values: Step1Data) => {
    onNext({ client: values })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">About you</h2>
        <p className="text-sm text-muted-foreground">Tell me who I&apos;ll be working with.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Your name *</Label>
        <Input id="name" placeholder="Jane Smith" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="company">Company / Organization *</Label>
        <Input id="company" placeholder="Acme Corp" {...register("company")} />
        {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="website">Website (optional)</Label>
        <Input id="website" placeholder="https://acme.com" {...register("website")} />
        {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" className="gap-2">
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
