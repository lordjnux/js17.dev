export const dynamic = "force-dynamic"

import { getAdminToken } from "@/lib/server-auth"
import { redirect } from "next/navigation"
import { SocialCommandCenter } from "@/components/admin/SocialCommandCenter"

export default async function AdminSocialPage() {
  const token = await getAdminToken()
  if (!token) redirect("/auth/signin?callbackUrl=/admin/social")

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <SocialCommandCenter />
    </main>
  )
}
