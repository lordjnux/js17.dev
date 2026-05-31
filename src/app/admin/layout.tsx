import type { Metadata } from "next"
import { inter, jetbrainsMono } from "@/lib/fonts"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin — js17.dev" },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions).catch(() => null)

  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-background text-foreground`}>
      <SessionProvider session={session ?? undefined}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          themes={["light", "dark", "titanium", "aurora"]}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </SessionProvider>
    </div>
  )
}
