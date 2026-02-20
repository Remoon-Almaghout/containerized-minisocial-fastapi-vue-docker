// frontend/playwright.config.js
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.E2E_EXTERNAL
    ? undefined
    : [
        {
          // FE dev server
          command: 'npm run dev -- --host 0.0.0.0 --port 8080',
          url: 'http://localhost:8080',
          reuseExistingServer: !process.env.CI,
        },
      ],
})
