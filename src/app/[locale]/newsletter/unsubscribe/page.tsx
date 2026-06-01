import { Suspense } from "react"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
}

async function UnsubscribeContent({ searchParams }: { searchParams: { status?: string; email?: string } }) {
  const t = await getTranslations("newsletter.unsubscribe")
  const status = searchParams.status
  const email = searchParams.email

  const isSuccess = status === "success"
  const isInvalid = status === "invalid"

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">

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

        {isSuccess && (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{t("successTitle")}</h1>
              {email && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{email}</span>
                  {" "}{t("successRemoved")}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {t("successNoMore")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("changedMind")}{" "}
              <Link href="/#newsletter" className="text-primary underline underline-offset-2 hover:no-underline">
                {t("resubscribe")}
              </Link>
            </p>
          </>
        )}

        {isInvalid && (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t("invalidTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("invalidMessage")}{" "}
              <a href="mailto:legal@js17.dev" className="text-primary underline underline-offset-2">
                legal@js17.dev
              </a>.
            </p>
          </div>
        )}

        {!isSuccess && !isInvalid && (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t("defaultTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("defaultMessage")}{" "}
              <a href="mailto:legal@js17.dev" className="text-primary underline underline-offset-2">
                legal@js17.dev
              </a>.
            </p>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("backHome")}
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
