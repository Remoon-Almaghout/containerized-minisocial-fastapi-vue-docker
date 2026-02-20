import { test, expect } from '@playwright/test'

test('Public Feed lädt', async ({ page }) => {
  await page.goto('/feed')

  await expect(page.getByRole('link', { name: /^Feed$/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /^Login$/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /^Register$/ })).toBeVisible()
})
