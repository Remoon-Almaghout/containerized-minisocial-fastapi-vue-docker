import { expect } from '@playwright/test'
import { BasePage } from './base.page'

export class ProfilePage extends BasePage {
  constructor(page) {
    super(page)
  }

  async expectProfileLoaded() {
    await expect(this.page.locator('text=User ID:')).toBeVisible()
  }
}
