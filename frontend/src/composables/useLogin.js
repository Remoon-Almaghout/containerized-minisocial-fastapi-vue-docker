// composables/useLogin.js
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'
import { useAuthForm } from './useAuthForm'

export function useLogin() {
  const router = useRouter()
  const { login: doLogin } = useAuth()

  const { email, password, error, loading, clearError, setErrorFromRequest } = useAuthForm()

  const login = async () => {
    clearError()

    const e = email.value.trim()
    if (!e || !password.value) {
      error.value = 'Please enter your email address and password.'
      return
    }

    loading.value = true
    try {
      await doLogin({
        email: e,
        username: e,
        password: password.value,
      })
      router.push('/feed')
    } catch (err) {
      setErrorFromRequest(err, 'Login failed.')
    } finally {
      loading.value = false
    }
  }

  return { email, password, error, loading, login }
}
