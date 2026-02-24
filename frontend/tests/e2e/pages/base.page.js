import { expect } from '@playwright/test'
import { S } from '../helpers/selectors'

export class BasePage {
  constructor(page) {
    this.page = page
  }

  async expectAppReady() {
    await expect(this.page.locator(S.app.title)).toBeVisible()
  }
}
