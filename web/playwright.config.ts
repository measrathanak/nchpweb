import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NODE_ENV: "development",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
      TYPO3_API_BASE_URL: "http://127.0.0.1:19999",
      REVALIDATE_SECRET: "playwright-secret",
      REVALIDATE_TIMESTAMP_TOLERANCE_SECONDS: "300",
    },
  },
});
