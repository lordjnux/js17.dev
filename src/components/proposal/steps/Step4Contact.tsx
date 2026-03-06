"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step4Schema, Step4Data } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProposalFormData } from "@/types/proposal"
import { LegalConsent } from "@/components/shared/LegalConsent"
import { ArrowLeft, ArrowRight } from "lucide-react"

const TIMEZONES = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00 (Hawaii)", "UTC-08:00 (Pacific)",
  "UTC-07:00 (Mountain)", "UTC-06:00 (Central)", "UTC-05:00 (Eastern)",
  "UTC-04:00 (Atlantic)", "UTC-03:00 (Buenos Aires)", "UTC-01:00 (Azores)",
  "UTC+00:00 (London/Lisbon)", "UTC+01:00 (Paris/Madrid)", "UTC+02:00 (Berlin/Warsaw)",
  "UTC+03:00 (Moscow/Istanbul)", "UTC+04:00 (Dubai)", "UTC+05:00 (Karachi)",
  "UTC+05:30 (Mumbai/Delhi)", "UTC+06:00 (Dhaka)", "UTC+07:00 (Bangkok)",
  "UTC+08:00 (Singapore/Beijing)", "UTC+09:00 (Tokyo/Seoul)", "UTC+10:00 (Sydney)",
  "UTC+12:00 (Auckland)",
]

interface StepProps {
  data: ProposalFormData
  onNext: (update: Partial<ProposalFormData>) => void
  onBack: () => void
}

export function Step4Contact({ data, onNext, onBack }: StepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: data.contact,
  })

  const onSubmit = (values: Step4Data) => {
    onNext({ contact: values })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Contact Details</h2>
        <p className="text-sm text-muted-foreground">How should I get back to you?</p>
      </div>

      <div className="space-y-1.5">
        <Label>Email *</Label>
        <Input type="email" placeholder="jane@acme.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Phone (optional)</Label>
        <Input type="tel" placeholder="+1 555 000 0000" {...register("phone")} />
      </div>

      <div className="space-y-1.5">
        <Label>Your timezone *</Label>
        <Controller
          name="timezone"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.timezone && <p className="text-xs text-destructive">{errors.timezone.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Preferred contact method *</Label>
        <Controller
          name="preferredContact"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="video">Video Call (Google Meet / Zoom)</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Additional notes (optional)</Label>
        <Textarea
          placeholder="Any other context that would help me understand your project..."
          className="min-h-[100px]"
          {...register("additionalNotes")}
        />
      </div>

      <Controller
        name="termsAccepted"
        control={control}
        render={({ field }) => (
          <LegalConsent
            id="proposal-terms"
            checked={field.value === true}
            onChange={field.onChange}
            error={errors.termsAccepted?.message}
            variant="proposal"
          />
        )}
      />

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
