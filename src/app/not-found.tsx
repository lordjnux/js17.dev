import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container-custom flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="font-mono text-blue-500 text-sm font-semibold mb-4">404</p>
      <h1 className="text-4xl font-bold mb-3">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  )
}
