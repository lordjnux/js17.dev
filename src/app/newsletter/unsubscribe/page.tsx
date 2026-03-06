import { Suspense } from "react"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
}

function UnsubscribeContent({ searchParams }: { searchParams: { status?: string; email?: string } }) {
  const status = searchParams.status
  const email = searchParams.email

  const isSuccess = status === "success"
  const isInvalid = status === "invalid"

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          {isSuccess ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          ) : isInvalid ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Message */}
        {isSuccess && (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Unsubscribed</h1>
              {email && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{email}</span>
                  {" "}has been removed from the js17.dev newsletter.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                You won&apos;t receive any more emails from us.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Changed your mind?{" "}
              <Link href="/#newsletter" className="text-primary underline underline-offset-2 hover:no-underline">
                Resubscribe
              </Link>
            </p>
          </>
        )}

        {isInvalid && (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Invalid link</h1>
            <p className="text-sm text-muted-foreground">
              This unsubscribe link is invalid or has already been used.
              If you&apos;d like to unsubscribe, email{" "}
              <a href="mailto:legal@js17.dev" className="text-primary underline underline-offset-2">
                legal@js17.dev
              </a>.
            </p>
          </div>
        )}

        {!isSuccess && !isInvalid && (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Unsubscribe</h1>
            <p className="text-sm text-muted-foreground">
              To unsubscribe, use the link in any email you received from js17.dev, or contact{" "}
              <a href="mailto:legal@js17.dev" className="text-primary underline underline-offset-2">
                legal@js17.dev
              </a>.
            </p>
          </div>
        )}

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to js17.dev
        </Link>

      </div>
    </div>
  )
}

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { status?: string; email?: string }
}) {
  return (
    <Suspense>
      <UnsubscribeContent searchParams={searchParams} />
    </Suspense>
  )
}
