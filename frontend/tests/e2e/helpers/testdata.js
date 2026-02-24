export const users = {
  existing: {
    email: process.env.E2E_EMAIL || 'test@example.com',
    password: process.env.E2E_PASSWORD || 'test1234',
  },
}

export function unique(prefix = 'E2E') {
  return `${prefix} ${Date.now()}`
}

export function newUser() {
  const ts = Date.now()
  return {
    username: `e2e_${ts}`,
    email: `e2e_${ts}@example.com`,
    password: 'test1234',
  }
}

export const rndUser = newUser
