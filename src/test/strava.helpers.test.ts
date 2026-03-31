import { describe, it, expect } from "vitest"
import {
  metersToKm,
  secsToPace,
  secsToDuration,
  formatDate,
  computeStreaks,
} from "@/lib/strava"
import type { StravaActivity } from "@/types/strava"

// ─── Formatting helpers ───────────────────────────────────────────────────────

describe("metersToKm", () => {
  it("converts exactly 1000m to 1.0 km", () => {
    expect(metersToKm(1000)).toBe("1.0 km")
  })

  it("converts 5523m to 5.5 km", () => {
    expect(metersToKm(5523)).toBe("5.5 km")
  })

  it("converts 42195m (marathon) to 42.2 km", () => {
    expect(metersToKm(42195)).toBe("42.2 km")
  })

  it("converts 0m to 0.0 km", () => {
    expect(metersToKm(0)).toBe("0.0 km")
  })
})

describe("secsToPace", () => {
  it("returns -- for zero speed", () => {
    expect(secsToPace(0)).toBe("--")
  })

  it("returns -- for negative speed", () => {
    expect(secsToPace(-1)).toBe("--")
  })

  it("calculates 6:00 /km for 2.778 m/s", () => {
    // 1000 / 2.778 ≈ 360s = 6:00
    expect(secsToPace(2.778)).toBe("6:00 /km")
  })

  it("calculates 5:00 /km for 3.333 m/s", () => {
    // 1000 / 3.333 ≈ 300s = 5:00
    expect(secsToPace(3.333)).toBe("5:00 /km")
  })

  it("pads seconds with leading zero", () => {
    // 1000 / 3.846 ≈ 260s = 4:20
    const result = secsToPace(3.846)
    expect(result).toMatch(/^\d+:\d{2} \/km$/)
  })
})

describe("secsToDuration", () => {
  it("shows minutes only for < 1 hour", () => {
    expect(secsToDuration(600)).toBe("10m")
  })

  it("shows hours and minutes for >= 1 hour", () => {
    expect(secsToDuration(3661)).toBe("1h 1m")
  })

  it("shows 0m for zero seconds", () => {
    expect(secsToDuration(0)).toBe("0m")
  })

  it("handles exactly 1 hour", () => {
    expect(secsToDuration(3600)).toBe("1h 0m")
  })

  it("handles 2h 30m", () => {
    expect(secsToDuration(9000)).toBe("2h 30m")
  })
})

describe("formatDate", () => {
  it("formats a date string to short month + day", () => {
    const result = formatDate("2026-03-15T08:30:00")
    expect(result).toMatch(/Mar 15/)
  })

  it("handles January correctly", () => {
    const result = formatDate("2026-01-01T00:00:00")
    expect(result).toMatch(/Jan 1/)
  })
})

// ─── Streak calculation ───────────────────────────────────────────────────────

function makeActivity(dateLocal: string, type = "Run"): StravaActivity {
  return {
    id: Math.random(),
    name: "Test Run",
    type,
    distance: 5000,
    moving_time: 1800,
    start_date_local: dateLocal + "T08:00:00Z",
    total_elevation_gain: 50,
    average_speed: 2.78,
  }
}

describe("computeStreaks", () => {
  it("returns 0,0 for empty activities", () => {
    expect(computeStreaks([])).toEqual({ current: 0, longest: 0 })
  })

  it("ignores non-Run activities", () => {
    const activities = [
      makeActivity("2026-03-30", "Ride"),
      makeActivity("2026-03-29", "Ride"),
    ]
    expect(computeStreaks(activities)).toEqual({ current: 0, longest: 0 })
  })

  it("counts a single run as streak of 1", () => {
    const today = new Date()
    const todayStr = today.toISOString().substring(0, 10)
    const activities = [makeActivity(todayStr)]
    const { current, longest } = computeStreaks(activities)
    expect(current).toBe(1)
    expect(longest).toBe(1)
  })

  it("detects consecutive daily streak", () => {
    // Build 5 consecutive days ending today
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const activities = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      return makeActivity(d.toISOString().substring(0, 10))
    })
    const { current, longest } = computeStreaks(activities)
    expect(current).toBe(5)
    expect(longest).toBe(5)
  })

  it("detects longest streak correctly when broken", () => {
    // 3 days in a row, gap, 2 days in a row
    const activities = [
      makeActivity("2026-01-10"),
      makeActivity("2026-01-09"),
      makeActivity("2026-01-08"),
      // gap on 01-07
      makeActivity("2026-01-06"),
      makeActivity("2026-01-05"),
    ]
    const { longest } = computeStreaks(activities)
    expect(longest).toBe(3)
  })

  it("deduplicates multiple runs on the same day", () => {
    const today = new Date()
    const todayStr = today.toISOString().substring(0, 10)
    const activities = [
      makeActivity(todayStr), // morning
      makeActivity(todayStr), // evening
    ]
    const { current } = computeStreaks(activities)
    expect(current).toBe(1)
  })

  it("starts streak from yesterday if no run today", () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const activities = [
      makeActivity(yesterday.toISOString().substring(0, 10)),
    ]
    const { current } = computeStreaks(activities)
    expect(current).toBe(1)
  })

  it("returns 0 current streak if last run was 2+ days ago", () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const activities = [
      makeActivity(twoDaysAgo.toISOString().substring(0, 10)),
    ]
    const { current } = computeStreaks(activities)
    expect(current).toBe(0)
  })
})
