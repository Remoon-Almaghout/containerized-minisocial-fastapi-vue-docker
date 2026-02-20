import { expect } from '@playwright/test'

export const rndUser = () => {
  const rnd = Date.now()
  return {
    username: `user${rnd}`,
    email: `user${rnd}@example.com`,
    password: 'Test1234!',
  }
}

export async function register(page, user) {
  await page.goto('/register')
  await page.getByPlaceholder('Username').fill(user.username)
  await page.getByPlaceholder('Email').fill(user.email)
  await page.getByPlaceholder('Password').fill(user.password)
  await page.getByRole('button', { name: /^Register$/ }).click()

  await expect(page).toHaveURL(/\/feed/, { timeout: 15000 })
}

export async function login(page, user) {
  await page.goto('/login')
  await page.getByPlaceholder('Email').fill(user.email)
  await page.getByPlaceholder('Password').fill(user.password)
  await page.getByRole('button', { name: /^Login$/ }).click()

  await expect(page).toHaveURL(/\/feed/, { timeout: 15000 })
  // stabiler Login-Indikator:
  await expect(page.getByRole('button', { name: /^Logout$/ })).toBeVisible({ timeout: 15000 })

  // optional zusätzlich: Feed-Route/Link
  await expect(page.getByRole('link', { name: /^Feed$/ })).toBeVisible()
}
