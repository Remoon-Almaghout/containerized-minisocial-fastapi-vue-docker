import { expect } from '@playwright/test'

export async function expectFeedReady(page) {
  // Feed route ist da
  await expect(page).toHaveURL(/\/feed/, { timeout: 15000 })

  // Wenn eingeloggt: Create-Post-Textarea muss erscheinen
  // (warte bewusst länger, weil /auth/me + posts lädt)
  await expect(page.getByPlaceholder("What's on your mind?")).toBeVisible({
    timeout: 15000,
  })
}
