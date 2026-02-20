<script setup>
import { ref } from 'vue'
import api from '../api/client'
import { useRouter } from 'vue-router'
import { setToken, refreshMe } from '../auth'

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const router = useRouter()

const register = async () => {
  error.value = ''

  if (!username.value || !email.value || !password.value) {
    error.value = 'Bitte alle Felder ausfüllen.'
    return
  }

  loading.value = true

  try {
    const res = await api.post('/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value,
    })

    setToken(res.data.access_token)
    await refreshMe()
    router.push('/feed')
  } catch (e) {
    error.value =
      e.response?.data?.detail || e.response?.data?.message || 'Registrierung fehlgeschlagen.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
      <h2 class="text-2xl font-semibold">Create account</h2>
      <p class="text-sm text-slate-500 mt-1">Join MiniSocial in seconds.</p>

      <form @submit.prevent="register" class="mt-6 space-y-3">
        <input
          v-model="username"
          placeholder="Username"
          class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />

        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />

        <button
          type="submit"
          :disabled="loading"
          class="w-full mt-2 bg-slate-900 text-white py-3 rounded-2xl font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>

        <p class="text-sm text-slate-500 text-center pt-2">
          Already have an account?
          <RouterLink to="/login" class="text-slate-900 font-semibold hover:underline">
            Login
          </RouterLink>
        </p>

        <p v-if="error" class="text-sm text-red-600 mt-3">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>
