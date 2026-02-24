import { expect } from '@playwright/test'
import { BasePage } from './base.page'
import { S } from '../helpers/selectors'

export class RegisterPage extends BasePage {
  constructor(page) {
    super(page)
    this.username = page.locator(S.auth.username)
    this.email = page.locator(S.auth.email)
    this.password = page.locator(S.auth.password)
    this.submit = page.locator(S.auth.btnRegister)
    this.error = page.locator('p.text-red-600')
  }

  async goto() {
    await this.page.goto('/register')
    await this.expectAppReady()
  }

  async register(username, email, password) {
    await this.username.fill(username)
    await this.email.fill(email)
    await this.password.fill(password)
    await this.submit.click()
  }

  async expectRegisterSuccess() {
    await expect(this.page).toHaveURL(/\/feed/)
  }

  async expectRegisterError() {
    await expect(this.error).toBeVisible()
  }
}
