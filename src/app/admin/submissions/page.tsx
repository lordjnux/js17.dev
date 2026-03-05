import { getServerSession } from "next-auth"
import { authOptions, ADMIN_EMAIL } from "@/lib/auth"
import { redirect } from "next/navigation"
import { list } from "@vercel/blob"
import type { SubmissionRecord } from "@/lib/moderation"

async function getSubmissions() {
  try {
    const { blobs } = await list({ prefix: "moderation/submissions.json" })
    if (blobs.length === 0) return []
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    return (await res.json()) as SubmissionRecord[]
  } catch {
    return []
  }
}

export default async function SubmissionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    redirect("/auth/signin")
  }

  const records = await getSubmissions()
  const total = records.length
  const blocked = records.filter((r) => r.action === "blocked").length
  const sent = records.filter((r) => r.action === "sent").length
  const bySource = {
    keyword: records.filter((r) => r.source === "keyword").length,
    openai: records.filter((r) => r.source === "openai").length,
    clean: records.filter((r) => r.source === "clean").length,
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Submission Moderation</h1>
        <p className="text-sm text-muted-foreground mt-1">Observability dashboard — last {total} submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total, color: "" },
          { label: "Sent", value: sent, color: "text-green-500" },
          { label: "Blocked", value: blocked, color: "text-destructive" },
          { label: "Block rate", value: total > 0 ? `${Math.round((blocked / total) * 100)}%` : "—", color: "text-yellow-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Detection source breakdown */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Detection Source</h2>
        <div className="flex gap-6 text-sm">
          <span>Keyword: <strong>{bySource.keyword}</strong></span>
          <span>OpenAI: <strong>{bySource.openai}</strong></span>
          <span>Clean: <strong>{bySource.clean}</strong></span>
        </div>
      </div>

      {/* Records table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Project</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Source</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No submissions yet</td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className={r.flagged ? "bg-destructive/5" : undefined}>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {new Date(r.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{r.clientName}</div>
                  <div className="text-xs text-muted-foreground">{r.company}</div>
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <div className="truncate">{r.projectTitle}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.excerpt}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.action === "blocked"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-green-500/15 text-green-600 dark:text-green-400"
                  }`}>
                    {r.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{r.source}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">
                  {r.reason || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
