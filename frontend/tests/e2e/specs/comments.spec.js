import { test } from '@playwright/test'
import { registerAndLogin } from '../helpers/auth.actions'
import { unique } from '../helpers/testdata'
import { createPostFlow, addCommentOnPostFlow, deleteOwnCommentFlow } from '../helpers/feed.actions'

test.describe('Comments', () => {
  test('logged-in user can add a comment', async ({ page }) => {
    await test.step('Register & login (fresh user)', async () => {
      await registerAndLogin(page)
    })

    const postText = unique('E2E Post for Comment')

    await test.step('Create a new post', async () => {
      await createPostFlow(page, postText)
    })

    const commentText = unique('E2E Comment')

    await test.step('Add a comment to the post', async () => {
      await addCommentOnPostFlow(page, postText, commentText)
    })
  })

  test('owner can delete own comment', async ({ page }) => {
    await test.step('Register & login (fresh user)', async () => {
      await registerAndLogin(page)
    })

    const postText = unique('E2E Post for Delete Comment')

    await test.step('Create a new post', async () => {
      await createPostFlow(page, postText)
    })

    const commentText = unique('E2E Comment to Delete')

    await test.step('Add a comment to the post', async () => {
      await addCommentOnPostFlow(page, postText, commentText)
    })

    await test.step('Delete the comment as the owner', async () => {
      await deleteOwnCommentFlow(page, postText, commentText)
    })
  })
})
