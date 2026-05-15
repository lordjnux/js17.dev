"use client"

import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { useRef } from "react"

const POSTS = [
  {
    label: "Origin Story",
    title: "Jack: The Co-Pilot I Wished I Had on the Road",
    slug: "/blog/jack-driver-assistant",
    readTime: "6 min read",
    date: "May 4, 2026",
    tags: ["Voice AI", "Road Safety", "Startup"],
  },
  {
    label: "Build in Public",
    title: "8 Versions in 10 Days: Jack's Road to Android Auto",
    slug: "/blog/jack-v08-road-to-android-auto",
    readTime: "9 min read",
    date: "May 10, 2026",
    tags: ["Android Auto", "Build in Public", "Mobile"],
  },
]

export function JackBlogLinks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })

  return (
    <section
      ref={ref}
      className="px-6 py-24 md:py-28"
      style={{ background: "#0a0a14" }}
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#00D4FF" }}
          >
            The Story So Far
          </p>
          <h2
            className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl"
            style={{ color: "#e8f4f8" }}
          >
            Read the journey.
          </h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {POSTS.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
            >
              <Link
                href={post.slug}
                className="group flex h-full flex-col rounded-2xl p-7 transition-all duration-200"
                style={{
                  background: "rgba(13,13,26,0.8)",
                  border: "1px solid rgba(0,212,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "rgba(0,212,255,0.25)"
                  ;(e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(0,212,255,0.04)"
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "rgba(0,212,255,0.08)"
                  ;(e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(13,13,26,0.8)"
                }}
              >
                <span
                  className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
                  style={{
                    background: "rgba(0,212,255,0.1)",
                    color: "#00D4FF",
                    border: "1px solid rgba(0,212,255,0.2)",
                  }}
                >
                  {post.label}
                </span>

                <h3
                  className="mb-auto text-lg font-bold leading-snug"
                  style={{ color: "#e8f4f8" }}
                >
                  {post.title}
                </h3>

                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#6b8fa8" }}>
                      {post.date}
                    </span>
                    <span className="text-xs" style={{ color: "#6b8fa8" }}>
                      {post.readTime}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-xs"
                        style={{ color: "#6b8fa8" }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className="mt-4 flex items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-1"
                  style={{ color: "#00D4FF" }}
                >
                  Read article
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
