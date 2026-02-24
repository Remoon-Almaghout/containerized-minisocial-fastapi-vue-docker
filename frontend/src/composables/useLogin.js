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
      error.value = 'Bitte Email und Passwort eingeben.'
      return
    }

    loading.value = true
    try {
      await doLogin({
        email: e,
        username: e, // falls dein Backend username akzeptiert/erwartet
        password: password.value,
      })
      router.push('/feed')
    } catch (err) {
      setErrorFromRequest(err, 'Login fehlgeschlagen.')
    } finally {
      loading.value = false
    }
  }

  return { email, password, error, loading, login }
}
