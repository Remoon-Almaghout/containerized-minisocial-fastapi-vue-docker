import { expect } from '@playwright/test'
import { S } from './selectors'

export async function waitForAppReady(page) {
  await expect(page.locator(S.app.title)).toBeVisible()
}

export async function waitForFeed(page) {
  await expect(page).toHaveURL(/\/feed/)
  await waitForAppReady(page)
}
