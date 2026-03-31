import { test, expect } from "@playwright/test"

test.describe("GET /api/strava/stats", () => {
  test("returns JSON response (200 with data or 503 if unconfigured)", async ({
    request,
  }) => {
    const res = await request.get("/api/strava/stats")
    expect([200, 503]).toContain(res.status())
    const body = await res.json()
    expect(body).toBeDefined()
  })

  test("200 response has expected shape", async ({ request }) => {
    const res = await request.get("/api/strava/stats")
    if (res.status() !== 200) {
      test.skip()
      return
    }
    const body = await res.json()
    expect(body).toHaveProperty("athlete")
    expect(body).toHaveProperty("stats")
    expect(body).toHaveProperty("recentActivities")
    expect(body).toHaveProperty("streaks")
    expect(body.streaks).toHaveProperty("current")
    expect(body.streaks).toHaveProperty("longest")
    expect(Array.isArray(body.recentActivities)).toBe(true)
  })

  test("503 response has error field", async ({ request }) => {
    const res = await request.get("/api/strava/stats")
    if (res.status() !== 503) {
      test.skip()
      return
    }
    const body = await res.json()
    expect(body).toHaveProperty("error")
  })
})

test.describe("GET /api/cron/refresh-strava", () => {
  test("returns 401 without auth token", async ({ request }) => {
    const res = await request.get("/api/cron/refresh-strava")
    expect(res.status()).toBe(401)
  })

  test("returns 401 with wrong token", async ({ request }) => {
    const res = await request.get("/api/cron/refresh-strava", {
      headers: { Authorization: "Bearer wrong" },
    })
    expect(res.status()).toBe(401)
  })
})
