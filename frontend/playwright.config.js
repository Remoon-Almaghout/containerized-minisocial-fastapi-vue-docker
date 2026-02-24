// frontend/playwright.config.js
import { defineConfig } from '@playwright/test'

const isExternal = !!process.env.E2E_EXTERNAL // Docker / already running
const baseURL =
  process.env.E2E_BASE_URL || (isExternal ? 'http://localhost:8080' : 'http://localhost:5173')

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,

  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  webServer: isExternal
    ? undefined
    : {
        command: 'npm run dev -- --host 0.0.0.0 --port 5173',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
