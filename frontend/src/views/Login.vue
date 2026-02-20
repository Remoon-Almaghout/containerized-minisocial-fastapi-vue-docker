<script setup>
import { ref } from 'vue'
import api from '../api/client'
import { useRouter } from 'vue-router'
import { setToken, refreshMe } from '../auth'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const router = useRouter()

const login = async () => {
  error.value = ''
  
  if (!email.value || !password.value) {
    error.value = 'Bitte Email und Passwort eingeben.'
    return
  }

  loading.value = true

  try {
    const res = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })

    setToken(res.data.access_token)

    // User-Daten neu laden
    await refreshMe()

    // Weiterleitung
    router.push('/feed')

  } catch (e) {
    error.value =
      e.response?.data?.message ||
      'Login fehlgeschlagen (Email/Passwort falsch).'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
      <h2 class="text-2xl font-semibold">Welcome back</h2>
      <p class="text-sm text-slate-500 mt-1">
        Login to like, comment and post.
      </p>

      <div class="mt-6">
        <form @submit.prevent="login" class="space-y-3">

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
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <p class="text-sm text-slate-500 text-center pt-2">
            No account?
            <RouterLink
              to="/register"
              class="text-slate-900 font-semibold hover:underline"
            >
              Register
            </RouterLink>
          </p>

          <p v-if="error" class="text-sm text-red-600 mt-3">
            {{ error }}
          </p>

        </form>
      </div>
    </div>
  </div>
</template>