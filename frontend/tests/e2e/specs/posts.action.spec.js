import { test } from '@playwright/test'
import { FeedPage } from '../pages/feed.page'

export async function createPostFlow(page, text) {
  const feed = new FeedPage(page)

  await test.step('Go to feed', async () => {
    await feed.goto()
  })

  await test.step(`Create post: "${text}"`, async () => {
    await feed.createPost(text)
  })

  return { feed }
}

export async function editPostFlow(page, originalText, newText) {
  const feed = new FeedPage(page)

  await test.step('Go to feed', async () => {
    await feed.goto()
  })

  await test.step(`Find post card by text: "${originalText}"`, async () => {
    await feed.cardByText(originalText)
  })

  const card = feed.cardByText(originalText)

  await test.step('Start editing the post', async () => {
    await feed.startEdit(card)
  })

  await test.step(`Save edited post: "${newText}"`, async () => {
    await feed.saveEdit(card, newText)
  })
}

export async function deletePostFlow(page, text) {
  const feed = new FeedPage(page)

  await test.step('Go to feed', async () => {
    await feed.goto()
  })

  const card = feed.cardByText(text)

  await test.step(`Delete post: "${text}"`, async () => {
    await feed.deletePost(card)
  })
}

export async function addCommentOnPostFlow(page, postText, commentText) {
  const feed = new FeedPage(page)

  await test.step('Go to feed', async () => {
    await feed.goto()
  })

  const card = feed.cardByText(postText)

  await test.step(`Open comments for post: "${postText}"`, async () => {
    await feed.openComments(card)
  })

  await test.step(`Add comment: "${commentText}"`, async () => {
    await feed.addComment(card, commentText)
  })
}

export async function deleteOwnCommentFlow(page, postText, commentText) {
  const feed = new FeedPage(page)

  await test.step('Go to feed', async () => {
    await feed.goto()
  })

  const card = feed.cardByText(postText)

  await test.step(`Open comments for post: "${postText}"`, async () => {
    await feed.openComments(card)
  })

  await test.step(`Delete own comment: "${commentText}"`, async () => {
    await feed.deleteOwnComment(card, commentText)
  })
}
