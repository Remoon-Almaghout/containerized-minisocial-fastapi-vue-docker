import { ref } from 'vue'

export function useAuthForm() {
  const email = ref('')
  const password = ref('')
  const error = ref('')
  const loading = ref(false)

  const clearError = () => {
    error.value = ''
  }

  const setErrorFromRequest = (err, fallback = 'Fehler.') => {
    error.value =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      (err?.request ? 'Server nicht erreichbar / CORS Problem.' : fallback)
  }

  return {
    email,
    password,
    error,
    loading,
    clearError,
    setErrorFromRequest,
  }
}
