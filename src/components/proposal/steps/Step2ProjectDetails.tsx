"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step2Schema, Step2Data } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProposalFormData } from "@/types/proposal"
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface StepProps {
  data: ProposalFormData
  onNext: (update: Partial<ProposalFormData>) => void
  onBack: () => void
}

export function Step2ProjectDetails({ data, onNext, onBack }: StepProps) {
  const [featureInput, setFeatureInput] = useState("")
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: data.project,
  })

  const features = watch("features") || []

  const addFeature = () => {
    if (featureInput.trim()) {
      setValue("features", [...features, featureInput.trim()])
      setFeatureInput("")
    }
  }

  const removeFeature = (index: number) => {
    setValue("features", features.filter((_, i) => i !== index))
  }

  const onSubmit = (values: Step2Data) => {
    onNext({ project: values })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Project Details</h2>
        <p className="text-sm text-muted-foreground">Tell me about what you want to build.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Project title *</Label>
        <Input placeholder="Customer dashboard redesign" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Project type *</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web-app">Web Application</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="ai-integration">AI Integration</SelectItem>
                  <SelectItem value="api">API / Backend</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Timeline *</Label>
          <Controller
            name="timeline"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2 weeks">1–2 weeks</SelectItem>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="2-3 months">2–3 months</SelectItem>
                  <SelectItem value="3-6 months">3–6 months</SelectItem>
                  <SelectItem value="6+ months">6+ months</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Project description *</Label>
        <Textarea
          placeholder="Describe what you're building, the problem it solves, and any technical constraints..."
          className="min-h-[120px]"
          {...register("description")}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Key features *</Label>
        <div className="flex gap-2">
          <Input
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
            placeholder="e.g. Real-time notifications"
          />
          <Button type="button" variant="outline" size="icon" onClick={addFeature}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {errors.features && <p className="text-xs text-destructive">{errors.features.message}</p>}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {features.map((feature, i) => (
              <Badge key={i} variant="secondary" className="gap-1.5 pr-1">
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
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
