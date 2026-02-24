import { test, expect, request } from '@playwright/test'

const API = process.env.API_BASE_URL || 'http://localhost:8000'

async function registerAndLogin(ctx) {
  const ts = Date.now()
  const user = {
    username: `api_${ts}`,
    email: `api_${ts}@example.com`,
    password: 'test1234',
  }

  let token = null

  await test.step('API setup: register user', async () => {
    const reg = await ctx.post('/auth/register', { data: user })
    expect(reg.ok()).toBeTruthy()
  })

  await test.step('API setup: login user', async () => {
    const login = await ctx.post('/auth/login', {
      data: { email: user.email, password: user.password },
    })
    expect(login.ok()).toBeTruthy()

    const body = await login.json()
    expect(body.access_token).toBeTruthy()
    token = body.access_token
  })

  return token
}

test('API: create post -> list -> update -> delete', async () => {
  const ctx = await request.newContext({ baseURL: API })
  const token = await registerAndLogin(ctx)

  let postId = null

  await test.step('Create a post', async () => {
    const create = await ctx.post('/posts', {
      data: { content: 'API Post ' + Date.now() },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(create.ok()).toBeTruthy()

    const created = await create.json()
    expect(created.id).toBeTruthy()
    postId = created.id
  })

  await test.step('List my feed (authenticated)', async () => {
    const list = await ctx.get('/posts/me-feed', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(list.ok()).toBeTruthy()

    const items = await list.json()
    expect(Array.isArray(items)).toBeTruthy()
  })

  await test.step('Update the post', async () => {
    const upd = await ctx.put(`/posts/${postId}`, {
      data: { content: 'API Updated ' + Date.now() },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(upd.ok()).toBeTruthy()
  })

  await test.step('Delete the post', async () => {
    const del = await ctx.delete(`/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(del.ok()).toBeTruthy()
  })

  await ctx.dispose()
})
