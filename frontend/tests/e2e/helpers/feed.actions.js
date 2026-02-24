import { FeedPage } from '../pages/feed.page'

export async function createPostFlow(page, text) {
  const feed = new FeedPage(page)
  await feed.goto()
  await feed.createPost(text)
  return { feed }
}

export async function editPostFlow(page, originalText, newText) {
  const feed = new FeedPage(page)
  await feed.goto()

  const card = feed.cardByText(originalText)
  await feed.startEdit(card)
  await feed.saveEdit(card, newText)
}

export async function deletePostFlow(page, text) {
  const feed = new FeedPage(page)
  await feed.goto()

  const card = feed.cardByText(text)
  await feed.deletePost(card)
}

export async function addCommentOnPostFlow(page, postText, commentText) {
  const feed = new FeedPage(page)
  await feed.goto()

  const card = feed.cardByText(postText)
  await feed.openComments(card)
  await feed.addComment(card, commentText)
}

export async function deleteOwnCommentFlow(page, postText, commentText) {
  const feed = new FeedPage(page)
  await feed.goto()

  const card = feed.cardByText(postText)
  await feed.openComments(card)
  await feed.deleteOwnComment(card, commentText)
}
