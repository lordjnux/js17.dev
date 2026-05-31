import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

export default function NotFound() {
  const t = useTranslations("notFound")
  return (
    <div className="container-custom flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="font-mono text-blue-500 text-sm font-semibold mb-4">{t("code")}</p>
      <h1 className="text-4xl font-bold mb-3">{t("title")}</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">{t("description")}</p>
      <Button asChild>
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  )
}
