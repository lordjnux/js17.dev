import { test, expect } from "@playwright/test"

test.describe("/hobbies page", () => {
  test("loads and shows hero heading", async ({ page }) => {
    await page.goto("/hobbies")
    await expect(page).toHaveTitle(/Hobbies/)
    await expect(page.getByText("Beyond The Code")).toBeVisible()
  })

  test("shows category tabs with Fit & Wellness active", async ({ page }) => {
    await page.goto("/hobbies")
    const fitBtn = page.getByRole("button", { name: /Fit & Wellness/i })
    await expect(fitBtn).toBeVisible()
    // Active tab has orange styling (contains the class)
    await expect(fitBtn).toHaveClass(/border-orange/)
  })

  test("shows Music and Travel as coming soon", async ({ page }) => {
    await page.goto("/hobbies")
    await expect(page.getByText(/Music/i)).toBeVisible()
    await expect(page.getByText(/Travel/i)).toBeVisible()
    const soonBadges = page.getByText("Soon")
    await expect(soonBadges.first()).toBeVisible()
  })

  test("shows stat cards grid (real data or skeleton)", async ({ page }) => {
    await page.goto("/hobbies")
    // The grid always renders — either real stat cards or skeleton placeholders
    await expect(page.locator(".grid").first()).toBeVisible({ timeout: 10000 })
  })

  test("shows CTA footer with proposal link", async ({ page }) => {
    await page.goto("/hobbies")
    const cta = page.getByRole("link", { name: /Ask me how/i })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute("href", "/proposal")
  })

  test("Hobbies link in navbar navigates correctly", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    const hobbiesLink = page.getByRole("link", { name: "Hobbies" }).first()
    await expect(hobbiesLink).toBeVisible()
    await hobbiesLink.click()
    await expect(page).toHaveURL(/\/hobbies/, { timeout: 10000 })
    await expect(page.getByText("Beyond The Code")).toBeVisible()
  })
})
