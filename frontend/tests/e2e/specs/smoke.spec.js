import { test, expect } from '@playwright/test'
import { waitForAppReady } from '../helpers/waits'
import { S } from '../helpers/selectors'

test.describe('Smoke', () => {
  test('app loads', async ({ page }) => {
    await test.step('Open home page', async () => {
      await page.goto('/')
    })

    await test.step('Wait for app shell to be ready', async () => {
      await waitForAppReady(page)
    })

    await test.step('Verify MiniSocial header is visible', async () => {
      await expect(page.locator(S.app.title)).toBeVisible()
    })
  })

  test('not found works', async ({ page }) => {
    await test.step('Open an unknown route', async () => {
      await page.goto('/this-route-should-not-exist-123')
    })

    await test.step('Wait for app shell to be ready', async () => {
      await waitForAppReady(page)
    })

    await test.step('Verify 404 page content', async () => {
      await expect(page.locator(S.notFound.title)).toBeVisible()
      await expect(page.locator(S.notFound.goFeed)).toBeVisible()
    })
  })
})
