import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'
import { useAuthForm } from './useAuthForm'

export function useRegister() {
  const router = useRouter()
  const { register: doRegister } = useAuth()

  const username = ref('')
  const { email, password, error, loading, clearError, setErrorFromRequest } = useAuthForm()

  const register = async () => {
    clearError()

    const u = username.value.trim()
    const e = email.value.trim()

    if (!u || !e || !password.value) {
      error.value = 'Please fill in all fields.'
      return
    }

    if (password.value.length < 6) {
      error.value = 'Password must be at least 6 characters long.'
      return
    }

    loading.value = true
    try {
      await doRegister({ username: u, email: e, password: password.value })
      router.push('/feed')
    } catch (err) {
      setErrorFromRequest(err, 'Registration failed.')
    } finally {
      loading.value = false
    }
  }

  return { username, email, password, error, loading, register }
}
