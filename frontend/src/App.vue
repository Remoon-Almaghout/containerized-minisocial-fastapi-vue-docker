<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import ToastHost from './components/ui/ToastHost.vue'
import ConfirmModal from './components/ui/ConfirmModal.vue'

const router = useRouter()
const { me, isAuthed, refreshMe, logout: doLogout } = useAuth()

const initials = computed(() => {
  if (!me.value?.username) return 'MS'
  return me.value.username.slice(0, 2).toUpperCase()
})

const logout = () => {
  doLogout()
  router.push('/login')
}

onMounted(() => {
  refreshMe()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <!-- Top Bar -->
    <header class="sticky top-0 z-50 backdrop-blur bg-white/75 border-b border-slate-200">
      <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <RouterLink to="/feed" class="flex items-center gap-3">
          <div
            class="h-9 w-9 rounded-xl bg-slate-900 text-white grid place-items-center font-semibold text-sm"
          >
            {{ initials }}
          </div>
          <div class="leading-tight">
            <h1 class="text-base font-semibold">MiniSocial</h1>
            <p class="text-xs text-slate-500 -mt-0.5">Clean social demo</p>
          </div>
        </RouterLink>

        <nav class="flex items-center gap-2">
          <RouterLink
            to="/feed"
            class="px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            Feed
          </RouterLink>

          <RouterLink
            v-if="isAuthed && me?.id"
            :to="`/profile/${me.id}`"
            class="px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            My Profile
          </RouterLink>

          <RouterLink
            v-if="!isAuthed"
            to="/login"
            class="px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            Login
          </RouterLink>

          <RouterLink
            v-if="!isAuthed"
            to="/register"
            class="px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            Register
          </RouterLink>

          <div v-if="isAuthed && me?.id" class="flex items-center gap-2 ml-1">
            <RouterLink :to="`/profile/${me.id}`" class="hidden sm:flex items-center gap-2">
              <div
                class="h-9 w-9 rounded-full bg-slate-200 grid place-items-center text-xs font-semibold"
              >
                {{ initials }}
              </div>
            </RouterLink>

            <button
              @click="logout"
              class="px-3 py-2 rounded-xl text-sm bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>

    <!-- Page Container -->
    <main class="flex-grow max-w-3xl mx-auto px-4 py-6 w-full">
      <RouterView />
    </main>

    <ConfirmModal />
    <ToastHost />
    
    <!--  Footer  -->
    <footer class="max-w-3xl mx-auto px-4 pb-10 text-xs text-slate-400">
      <p>MiniSocial • FastAPI + Vue 3 • JWT • SQLite • Docker</p>
    </footer>
  </div>
</template>