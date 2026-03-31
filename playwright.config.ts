import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  timeout: 30000,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "https://sandbox.js17.dev",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
