import { ref, computed } from 'vue'
import { AuthService } from '../services/auth.service'

const token = ref(localStorage.getItem('access_token') || '')
const me = ref(null)

const isAuthed = computed(() => !!token.value)

function setToken(t) {
  token.value = t || ''
  if (token.value) {
    localStorage.setItem('access_token', token.value)
  } else {
    localStorage.removeItem('access_token')
    me.value = null
  }
}

async function refreshMe() {
  if (!token.value) {
    me.value = null
    return null
  }

  try {
    const res = await AuthService.me()
    me.value = res.data
    return me.value
  } catch (err) {
    const status = err?.response?.status
    if (status === 401 || status === 403) {
      setToken('')
    }
    me.value = null
    return null
  }
}

async function login(credentials) {
  const res = await AuthService.login(credentials)
  const newToken = res.data.access_token || res.data.token || res.data.accessToken
  setToken(newToken)
  await refreshMe()
  return res.data
}

async function register(payload) {
  const res = await AuthService.register(payload)
  const newToken = res.data.access_token || res.data.token || res.data.accessToken
  setToken(newToken)
  await refreshMe()
  return res.data
}

function logout() {
  setToken('')
  me.value = null
}

export function useAuth() {
  return {
    token,
    me,
    isAuthed,
    setToken,
    refreshMe,
    login,
    register,
    logout,
  }
}
