import { expect } from '@playwright/test'
import { BasePage } from './base.page'
import { S } from '../helpers/selectors'

export class FeedPage extends BasePage {
  constructor(page) {
    super(page)
    this.composer = page.locator(S.feed.composer)
    this.content = page.locator(S.feed.postContent)
    this.submit = page.locator(S.feed.postSubmit)
    this.postCard = page.locator(S.feed.postCard)
  }

  async goto() {
    await this.page.goto('/feed')
    await this.expectAppReady()
  }

  async expectComposerVisible() {
    await expect(this.composer).toBeVisible()
  }

  cardByText(text) {
    return this.page.locator(`${S.feed.postCard}:has-text("${text}")`).first()
  }

  async createPost(text) {
    await this.expectComposerVisible()
    await this.content.fill(text)
    await this.submit.click()
    await expect(this.cardByText(text)).toBeVisible()
  }

  firstCard() {
    return this.page.locator(S.feed.postCard).first()
  }

  async openComments(card) {
    await expect(card).toBeVisible()
    await card.locator(S.feed.btnComments).click()
  }

  async addComment(card, text) {
    await expect(card.locator(S.feed.commentInput)).toBeVisible()
    await card.locator(S.feed.commentInput).fill(text)
    await card.locator(S.feed.commentSend).click()
    await expect(card.locator(`text=${text}`)).toBeVisible()
  }

  async deleteOwnComment(card, commentText) {
    // Kommentar-Block finden
    const commentRow = card.locator(`div:has-text("${commentText}")`).first()
    await expect(commentRow).toBeVisible()

    // Delete Button im Kommentar-Bereich klicken (scoped!)
    await commentRow.locator(S.feed.btnDeleteComment).click()

    // ConfirmModal gezielt bestätigen (nicht den Delete-Post Button)
    const modal = this.page.locator('.fixed.inset-0.z-\\[120\\]')
    await expect(modal).toBeVisible()
    await modal.locator('button:has-text("Löschen"), button:has-text("Delete")').last().click()

    // Kommentar darf nicht mehr sichtbar sein
    await expect(card.locator(`text=${commentText}`)).toHaveCount(0)
  }

  async startEdit(card) {
    await card.locator(S.feed.btnEditPost).click()
    await expect(card.locator(S.feed.editTextarea)).toBeVisible()
  }

  async saveEdit(card, newText) {
    await card.locator(S.feed.editTextarea).fill(newText)
    await card.locator(S.feed.btnSaveEdit).click()
    await expect(card.locator(`text=${newText}`)).toBeVisible()
  }

  async deletePost(card) {
    await card.locator(S.feed.btnDeletePost).first().click()

    const modal = this.page.locator('.fixed.inset-0.z-\\[120\\]')
    await expect(modal).toBeVisible()
    await modal.locator('button:has-text("Löschen"), button:has-text("Delete")').last().click()

    await expect(card).toHaveCount(0)
  }
}
