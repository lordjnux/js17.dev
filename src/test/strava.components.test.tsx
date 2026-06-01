import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StravaStatCard } from "@/components/hobbies/StravaStatCard"
import { RecentActivitiesFeed } from "@/components/hobbies/RecentActivitiesFeed"
import type { StravaActivity } from "@/types/strava"

// ─── StravaStatCard ───────────────────────────────────────────────────────────

describe("StravaStatCard", () => {
  it("renders label and icon", () => {
    render(
      <StravaStatCard label="Total Distance" value="342.1 km" icon="🗺️" />
    )
    expect(screen.getByText("Total Distance")).toBeInTheDocument()
    expect(screen.getByText("🗺️")).toBeInTheDocument()
  })

  it("renders subValue when provided", () => {
    render(
      <StravaStatCard
        label="Total Runs"
        value="87 runs"
        subValue="YTD: 23 runs"
        icon="👟"
      />
    )
    expect(screen.getByText("YTD: 23 runs")).toBeInTheDocument()
  })

  it("does not render subValue when omitted", () => {
    render(<StravaStatCard label="Streak" value="7 days" icon="🔥" />)
    expect(screen.queryByText(/YTD/)).not.toBeInTheDocument()
  })
})

// ─── RecentActivitiesFeed ─────────────────────────────────────────────────────

const mockActivities: StravaActivity[] = [
  {
    id: 1,
    name: "Morning Run",
    type: "Run",
    sport_type: "Run",
    distance: 5000,
    moving_time: 1800,
    start_date_local: "2026-03-30T08:00:00Z",
    total_elevation_gain: 30,
    average_speed: 2.78,
  },
  {
    id: 2,
    name: "Evening Easy",
    type: "Run",
    sport_type: "Run",
    distance: 8000,
    moving_time: 3000,
    start_date_local: "2026-03-29T18:00:00Z",
    total_elevation_gain: 50,
    average_speed: 2.67,
  },
]

describe("RecentActivitiesFeed", () => {
  it("renders activity names", () => {
    render(<RecentActivitiesFeed activities={mockActivities} />)
    expect(screen.getByText("Morning Run")).toBeInTheDocument()
    expect(screen.getByText("Evening Easy")).toBeInTheDocument()
  })

  it("renders empty state when no activities", () => {
    render(<RecentActivitiesFeed activities={[]} />)
    expect(screen.getByText(/No recent activities/i)).toBeInTheDocument()
  })

  it("renders table headers", () => {
    render(<RecentActivitiesFeed activities={mockActivities} />)
    expect(screen.getByText("Distance")).toBeInTheDocument()
    expect(screen.getByText("Pace")).toBeInTheDocument()
    expect(screen.getByText("Duration")).toBeInTheDocument()
  })

  it("limits display to 10 activities", () => {
    const many = Array.from({ length: 15 }, (_, i) => ({
      ...mockActivities[0],
      id: i + 1,
      name: `Run ${i + 1}`,
    }))
    render(<RecentActivitiesFeed activities={many} />)
    const rows = document.querySelectorAll("tbody tr")
    expect(rows.length).toBeLessThanOrEqual(10)
  })
})
