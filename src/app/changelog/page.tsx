import { getAllChangelog, ChangelogCategory } from "@/lib/changelog"
import { MDXRemote } from "next-mdx-remote/rsc"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Code2, Rocket, Shield, Wrench, Zap, ExternalLink } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Changelog — js17.dev",
  description:
    "What's been built, how it was built, and why it matters — a human-readable release history for developers and clients alike.",
}

const CATEGORY_META: Record<
  ChangelogCategory,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  launch: {
    label: "Launch",
    icon: <Rocket className="h-3.5 w-3.5" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  feature: {
    label: "Feature",
    icon: <Zap className="h-3.5 w-3.5" />,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  infrastructure: {
    label: "Infrastructure",
    icon: <Wrench className="h-3.5 w-3.5" />,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  security: {
    label: "Security",
    icon: <Shield className="h-3.5 w-3.5" />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  fix: {
    label: "Fix",
    icon: <Code2 className="h-3.5 w-3.5" />,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso))
}

export default function ChangelogPage() {
  const entries = getAllChangelog()

  return (
    <main className="min-h-screen py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        <SectionHeader
          label="Release History"
          title="Changelog"
          description="What's been built, how it was solved, and why it matters — written for developers and clients equally."
        />

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center mb-14 -mt-4">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.bg} ${meta.color}`}
            >
              {meta.icon}
              {meta.label}
            </span>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border hidden sm:block" />

          <div className="space-y-14">
            {entries.map((entry, i) => {
              const meta = CATEGORY_META[entry.category]
              const isLatest = i === 0

              return (
                <div key={entry.slug} className="relative sm:pl-10">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 top-1.5 hidden sm:flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      isLatest
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full bg-current" />
                  </div>

                  {/* Card */}
                  <article className="rounded-xl border bg-card overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-lg font-bold tracking-tight">
                            v{entry.version}
                          </span>
                          {isLatest && (
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                              Latest
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.bg} ${meta.color}`}
                          >
                            {meta.icon}
                            {meta.label}
                          </span>
                        </div>
                        <time
                          dateTime={entry.date}
                          className="text-sm text-muted-foreground whitespace-nowrap"
                        >
                          {formatDate(entry.date)}
                        </time>
                      </div>

                      <h2 className="text-xl font-bold mb-2">{entry.title}</h2>
                      <p className="text-muted-foreground leading-relaxed">{entry.headline}</p>
                    </div>

                    {/* Body — MDX prose */}
                    <div className="p-6 prose prose-sm dark:prose-invert max-w-none
                      prose-headings:font-semibold prose-headings:text-foreground
                      prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3
                      prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2
                      prose-p:text-muted-foreground prose-p:leading-relaxed
                      prose-li:text-muted-foreground prose-li:leading-relaxed
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-ol:mt-2 prose-ul:mt-2">
                      <MDXRemote source={entry.content} />
                    </div>

                    {/* Footer — skills + value callouts */}
                    <div className="border-t divide-y">
                      {/* Client value */}
                      <div className="px-6 py-4 bg-primary/5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1.5">
                          What this means for you as a client
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {entry.clientValue}
                        </p>
                      </div>

                      {/* Dev notes */}
                      <details className="group px-6 py-4">
                        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2">
                          <Code2 className="h-3.5 w-3.5" />
                          Developer notes
                          <span className="ml-auto text-[10px] group-open:hidden">▼ expand</span>
                          <span className="ml-auto text-[10px] hidden group-open:inline">▲ collapse</span>
                        </summary>
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-mono">
                          {entry.devNotes}
                        </p>
                      </details>

                      {/* Skills */}
                      <div className="px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5">
                          Skills demonstrated
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 rounded-xl border bg-card p-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Want to see what gets built next? Follow along or start a project.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://github.com/lordjnux/js17.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              View on GitHub
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
            <a
              href="/proposal"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Start a project
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
