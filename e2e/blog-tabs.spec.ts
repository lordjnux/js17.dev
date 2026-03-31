import { test, expect } from "@playwright/test"

test.describe("/blog category tabs", () => {
  test("shows category tabs on blog page", async ({ page }) => {
    await page.goto("/blog", { timeout: 45000 })
    await expect(page.getByRole("button", { name: "All Posts" })).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole("button", { name: "Engineering" })).toBeVisible()
    await expect(page.getByRole("button", { name: /Hobbies Stats/i })).toBeVisible()
  })

  test("All Posts tab is active by default", async ({ page }) => {
    await page.goto("/blog")
    const allTab = page.getByRole("button", { name: "All Posts" })
    await expect(allTab).toHaveClass(/border-blue/)
  })

  test("Engineering tab filters posts and updates URL", async ({ page }) => {
    await page.goto("/blog")
    await page.getByRole("button", { name: "Engineering" }).click()
    await expect(page).toHaveURL(/category=engineering/)
  })

  test("Hobbies Stats tab navigates to /hobbies", async ({ page }) => {
    await page.goto("/blog")
    await page.getByRole("button", { name: /Hobbies Stats/i }).click()
    await expect(page).toHaveURL(/\/hobbies/)
  })

  test("blog page still shows posts when no category filter", async ({ page }) => {
    await page.goto("/blog")
    // At least one article card should be visible
    await expect(page.locator("article, [data-testid='post-card']").first()).toBeVisible({
      timeout: 8000,
    })
  })
})
