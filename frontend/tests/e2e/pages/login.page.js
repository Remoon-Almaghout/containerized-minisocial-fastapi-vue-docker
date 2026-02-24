import { expect } from '@playwright/test'
import { BasePage } from './base.page'
import { S } from '../helpers/selectors'

export class LoginPage extends BasePage {
  constructor(page) {
    super(page)
    this.email = page.locator(S.auth.email)
    this.password = page.locator(S.auth.password)
    this.submit = page.locator(S.auth.btnLogin)
    this.error = page.locator('p.text-red-600')
  }

  async goto() {
    await this.page.goto('/login')
    await this.expectAppReady()
  }

  async login(email, password) {
    await this.email.fill(email)
    await this.password.fill(password)
    await this.submit.click()
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/\/feed/)
  }

  async expectLoginError() {
    await expect(this.error).toBeVisible()
  }
}
