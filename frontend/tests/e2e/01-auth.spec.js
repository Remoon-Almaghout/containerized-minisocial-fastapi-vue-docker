import { test, expect } from '@playwright/test'
import { rndUser, register, login } from './helpers/auth.js'

test('Register → Feed', async ({ page }) => {
  const user = rndUser()
  await register(page, user)
})

test('Login → Feed (nach Register)', async ({ page }) => {
  const user = rndUser()
  await register(page, user)

  // logout
  await page.getByRole('button', { name: /^Logout$/ }).click()
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 })

  // login
  await login(page, user)
})
