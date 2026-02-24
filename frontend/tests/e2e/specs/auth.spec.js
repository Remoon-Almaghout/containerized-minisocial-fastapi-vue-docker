import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { RegisterPage } from '../pages/register.page'
import { newUser } from '../helpers/testdata'

test.describe('Auth', () => {
  test('user can register and is redirected to feed', async ({ page }) => {
    const u = newUser()

    await test.step('Open register page', async () => {
      const register = new RegisterPage(page)
      await register.goto()
    })

    await test.step('Register new user', async () => {
      const register = new RegisterPage(page)
      await register.register(u.username, u.email, u.password)
    })

    await test.step('Verify redirect to feed after registration', async () => {
      const register = new RegisterPage(page)
      await register.expectRegisterSuccess()
    })

    await test.step('Sanity check: app shell is visible', async () => {
      await expect(page.locator('header a:has-text("MiniSocial")')).toBeVisible()
    })
  })

  test('user can login after registration', async ({ page }) => {
    const u = newUser()

    await test.step('Register a new user', async () => {
      const register = new RegisterPage(page)
      await register.goto()
      await register.register(u.username, u.email, u.password)
      await register.expectRegisterSuccess()
    })

    await test.step('Logout (if available)', async () => {
      const logoutBtn = page.locator('button:has-text("Logout")')
      if (await logoutBtn.count()) {
        await logoutBtn.click()
      }
      await expect(page).toHaveURL(/\/login|\/feed/) // tolerant (je nach router)
    })

    await test.step('Login with the newly created credentials', async () => {
      const login = new LoginPage(page)
      await login.goto()
      await login.login(u.email, u.password)
    })

    await test.step('Verify login success (redirect to feed)', async () => {
      const login = new LoginPage(page)
      await login.expectLoginSuccess()
    })
  })

  test('login shows error with wrong credentials', async ({ page }) => {
    await test.step('Open login page', async () => {
      const login = new LoginPage(page)
      await login.goto()
    })

    await test.step('Attempt login with invalid credentials', async () => {
      const login = new LoginPage(page)
      await login.login('wrong@example.com', 'wrongpass')
    })

    await test.step('Verify error message + still on /login', async () => {
      const login = new LoginPage(page)
      await login.expectLoginError()
      await expect(page).toHaveURL(/\/login/)
    })
  })
})
