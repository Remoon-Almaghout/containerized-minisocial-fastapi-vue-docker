import { test, expect } from '@playwright/test'
import { registerAndLogin } from '../helpers/auth.actions'
import { ProfilePage } from '../pages/profile.page'

test.describe('Profile', () => {
  test('user can open own profile from nav', async ({ page }) => {
    await test.step('Register & login (fresh user)', async () => {
      await registerAndLogin(page)
    })

    await test.step('Open "My Profile" from navigation', async () => {
      await page.locator('text=My Profile').click()
    })

    await test.step('Verify profile page is loaded', async () => {
      const profile = new ProfilePage(page)
      await profile.expectProfileLoaded()
    })

    await test.step('Verify URL matches /profile/:id', async () => {
      await expect(page).toHaveURL(/\/profile\//)
    })
  })
})
