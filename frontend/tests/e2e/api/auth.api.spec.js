import { test, expect, request } from '@playwright/test'

const API = process.env.API_BASE_URL || 'http://localhost:8000'

test('API: register -> login -> me', async () => {
  const ctx = await request.newContext({ baseURL: API })

  const ts = Date.now()
  const user = {
    username: `api_${ts}`,
    email: `api_${ts}@example.com`,
    password: 'test1234',
  }

  let token = null

  await test.step('Register a new user', async () => {
    const reg = await ctx.post('/auth/register', { data: user })
    expect(reg.ok()).toBeTruthy()

    const regBody = await reg.json()
    expect(regBody.access_token).toBeTruthy()
  })

  await test.step('Login with the new user', async () => {
    const login = await ctx.post('/auth/login', {
      data: { email: user.email, password: user.password },
    })
    expect(login.ok()).toBeTruthy()

    const loginBody = await login.json()
    expect(loginBody.access_token).toBeTruthy()
    token = loginBody.access_token
  })

  await test.step('Fetch /auth/me using the access token', async () => {
    const me = await ctx.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(me.ok()).toBeTruthy()

    const meBody = await me.json()
    expect(meBody.email).toBe(user.email)
  })

  await ctx.dispose()
})
