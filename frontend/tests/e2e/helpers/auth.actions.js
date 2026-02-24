import { LoginPage } from '../pages/login.page'
import { RegisterPage } from '../pages/register.page'
import { newUser, users } from './testdata'

export async function registerAndLogin(page) {
  const u = newUser()
  const register = new RegisterPage(page)
  await register.goto()
  await register.register(u.username, u.email, u.password)
  await register.expectRegisterSuccess()
  return u
}

export async function loginViaUI(page, user = users.existing) {
  const login = new LoginPage(page)
  await login.goto()
  await login.login(user.email, user.password)
  await login.expectLoginSuccess()
}

export const login = loginViaUI
export async function register(page, user) {
  const register = new RegisterPage(page)
  await register.goto()
  await register.register(user.username, user.email, user.password)
  await register.expectRegisterSuccess()
}
