/**
 * Blog metadata persistence — MongoDB collection "blog_posts"
 *
 * Timestamps recorded per document:
 *   publishedAt  — Date parsed from the MDX frontmatter "date" field
 *   createdAt    — First time this slug was written to MongoDB ($setOnInsert)
 *   updatedAt    — Every sync run (tracks content drift over time)
 *   syncedAt     — Wall-clock time of the most recent upsert (ISO string, for CLI queries)
 */

import { Collection, WithId } from "mongodb"
import { getDb } from "./mongodb"
import { Post } from "@/types/blog"

export interface BlogMetadataDoc {
  slug: string
  title: string
  description: string
  tags: string[]
  published: boolean
  /** Raw date string from MDX frontmatter — "YYYY-MM-DD" */
  frontmatterDate: string
  /** Date object parsed from frontmatterDate — primary timestamp for queries */
  publishedAt: Date
  readingTime: number | null
  /** Set once on first insert — never overwritten */
  createdAt: Date
  /** Updated on every sync — tracks last content change */
  updatedAt: Date
  /** ISO string of last sync wall-clock time — easy CLI inspection */
  syncedAt: string
}

const COLLECTION = "blog_posts"

async function col(): Promise<Collection<BlogMetadataDoc>> {
  const db = await getDb()
  return db.collection<BlogMetadataDoc>(COLLECTION)
}

/** Create unique index on slug (idempotent). Call once at app startup or on first sync. */
export async function ensureIndexes(): Promise<void> {
  const c = await col()
  await c.createIndex({ slug: 1 }, { unique: true })
  await c.createIndex({ publishedAt: -1 })
}

/** Upsert a single post's metadata. Preserves createdAt on subsequent calls. */
export async function upsertPost(post: Post): Promise<void> {
  const c = await col()
  const now = new Date()

  // Parse "YYYY-MM-DD" without TZ shift
  const [y, m, d] = post.frontmatter.date.split("-").map(Number)
  const publishedAt = new Date(y, m - 1, d)

  await c.updateOne(
    { slug: post.slug },
    {
      $set: {
        slug: post.slug,
        title: post.frontmatter.title,
        description: post.frontmatter.description,
        tags: post.frontmatter.tags,
        published: post.frontmatter.published,
        frontmatterDate: post.frontmatter.date,
        publishedAt,
        readingTime: post.frontmatter.readingTime ?? null,
        updatedAt: now,
        syncedAt: now.toISOString(),
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  )
}

/** Sync all posts. Returns counts and any per-slug errors. */
export async function syncAllPosts(posts: Post[]): Promise<{
  synced: number
  errors: Array<{ slug: string; error: string }>
}> {
  await ensureIndexes()
  let synced = 0
  const errors: Array<{ slug: string; error: string }> = []

  for (const post of posts) {
    try {
      await upsertPost(post)
      synced++
    } catch (err) {
      errors.push({ slug: post.slug, error: String(err) })
    }
  }

  return { synced, errors }
}

/** Fetch all metadata records sorted by publishedAt descending. */
export async function getAllMetadata(): Promise<WithId<BlogMetadataDoc>[]> {
  const c = await col()
  return c.find({}).sort({ publishedAt: -1 }).toArray()
}

/** Fetch metadata for a single slug. */
export async function getMetadataBySlug(
  slug: string,
): Promise<WithId<BlogMetadataDoc> | null> {
  const c = await col()
  return c.findOne({ slug })
}
