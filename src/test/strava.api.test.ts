import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// ─── Mock @vercel/blob ────────────────────────────────────────────────────────
vi.mock("@vercel/blob", () => ({
  list: vi.fn().mockResolvedValue({ blobs: [] }),
  put: vi.fn().mockResolvedValue({ url: "https://blob.vercel-storage.com/test" }),
}))

// ─── Mock next/cache ─────────────────────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// ─── /api/strava/stats ───────────────────────────────────────────────────────

describe("GET /api/strava/stats", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("returns 503 when STRAVA_CLIENT_ID is not set", async () => {
    vi.stubEnv("STRAVA_CLIENT_ID", "")
    const { GET } = await import("@/app/api/strava/stats/route")
    const res = await GET()
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })
})

// ─── /api/cron/refresh-strava ────────────────────────────────────────────────

describe("GET /api/cron/refresh-strava", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv("CRON_SECRET", "test-cron-secret")
  })

  it("returns 401 with no Authorization header", async () => {
    const { GET } = await import("@/app/api/cron/refresh-strava/route")
    const req = new NextRequest("http://localhost/api/cron/refresh-strava")
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it("returns 401 with wrong token", async () => {
    const { GET } = await import("@/app/api/cron/refresh-strava/route")
    const req = new NextRequest("http://localhost/api/cron/refresh-strava", {
      headers: { Authorization: "Bearer wrong-token" },
    })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it("returns 500 when STRAVA_CLIENT_ID is not configured", async () => {
    vi.stubEnv("STRAVA_CLIENT_ID", "")
    const { GET } = await import("@/app/api/cron/refresh-strava/route")
    const req = new NextRequest("http://localhost/api/cron/refresh-strava", {
      headers: { Authorization: "Bearer test-cron-secret" },
    })
    const res = await GET(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })
})

// ─── /api/cron/refresh-credly (Strava integration) ───────────────────────────

describe("GET /api/cron/refresh-credly — Strava branch", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv("CRON_SECRET", "test-cron-secret")
    vi.stubEnv("CREDLY_USERNAME", "")
  })

  it("returns 401 without valid auth", async () => {
    const { GET } = await import("@/app/api/cron/refresh-credly/route")
    const req = new NextRequest("http://localhost/api/cron/refresh-credly")
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it("returns 500 when CREDLY_USERNAME is missing", async () => {
    vi.stubEnv("CREDLY_USERNAME", "")
    const { GET } = await import("@/app/api/cron/refresh-credly/route")
    const req = new NextRequest("http://localhost/api/cron/refresh-credly", {
      headers: { Authorization: "Bearer test-cron-secret" },
    })
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})
