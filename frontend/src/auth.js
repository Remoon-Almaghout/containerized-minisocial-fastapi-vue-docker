import { ref, computed } from 'vue'
import api from './api/client'

export const token = ref(localStorage.getItem('access_token') || '')
export const isAuthed = computed(() => !!token.value)

export const me = ref(null)

export const setToken = (t) => {
  token.value = t || ''
  if (token.value) localStorage.setItem('access_token', token.value)
  else localStorage.removeItem('access_token')
}

export const refreshMe = async () => {
  if (!token.value) {
    me.value = null
    return
  }
  try {
    const res = await api.get('/auth/me')
    me.value = res.data
  } catch {
    // Token ungültig/abgelaufen -> clean
    setToken('')
    me.value = null
  }
}

export const logout = () => {
  setToken('')
  me.value = null
}
