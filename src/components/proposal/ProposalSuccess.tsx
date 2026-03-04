import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProposalSuccess() {
  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-green-500/10 p-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3">Proposal Received!</h2>
      <p className="text-muted-foreground mb-2 max-w-md mx-auto leading-relaxed">
        Thanks for reaching out. I&apos;ll review your project details and get back
        to you within 24 hours on business days.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Check your email for a confirmation receipt.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/blog">Read the Blog</Link>
        </Button>
      </div>
    </div>
  )
}
