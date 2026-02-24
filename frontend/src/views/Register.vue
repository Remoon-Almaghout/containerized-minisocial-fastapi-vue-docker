<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const router = useRouter()
const { register: doRegister } = useAuth()

const register = async () => {
  error.value = ''

  const u = username.value.trim()
  const e = email.value.trim()

  if (!u || !e || !password.value) {
    error.value = 'Bitte alle Felder ausfüllen.'
    return
  }

  // optional: schnelle client-side validation
  if (password.value.length < 6) {
    error.value = 'Passwort muss mindestens 6 Zeichen haben.'
    return
  }

  loading.value = true
  try {
    await doRegister({
      username: u,
      email: e,
      password: password.value,
    })

    router.push('/feed')
  } catch (err) {
    error.value =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      (err.request ? 'Server nicht erreichbar / CORS Problem.' : 'Registrierung fehlgeschlagen.')
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