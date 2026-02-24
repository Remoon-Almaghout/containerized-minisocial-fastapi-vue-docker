// composables/useProfile.js
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '../ui/toast'
import { useAuth } from './useAuth'
import { UserService } from '../services/user.service'
import { getErrorMessage } from '../utils/error.util'
import { usePostInteractions } from './usePostInteractions'

export function useProfile() {
  const { push } = useToast()
  const { me, isAuthed } = useAuth()
  const route = useRoute()

  // data
  const user = ref(null)
  const posts = ref([])

  // ui state
  const loadingProfile = ref(false)

  // computed
  const routeId = computed(() => String(route.params.id))

  const isMyProfile = computed(() => {
    return !!me.value?.id && String(me.value.id) === routeId.value
  })

  const initials = computed(() => {
    const name = user.value?.username || 'User'
    return name.slice(0, 2).toUpperCase()
  })

  const stats = computed(() => {
    const totalPosts = posts.value.length
    const likes = posts.value.reduce((acc, p) => acc + (p.likes_count ?? 0), 0)
    const comments = posts.value.reduce((acc, p) => acc + (p.comments_count ?? 0), 0)
    return { totalPosts, likes, comments }
  })

  // actions
  const loadProfile = async () => {
    const id = routeId.value
    loadingProfile.value = true

    try {
      const [u, p] = await Promise.all([UserService.get(id), UserService.posts(id)])
      user.value = u.data
      posts.value = p.data || []
    } catch (err) {
      user.value = null
      posts.value = []
      push(getErrorMessage(err, 'Profil konnte nicht geladen werden ❌'), 'error')
      console.error(err)
    } finally {
      loadingProfile.value = false
    }
  }

  const postUI = usePostInteractions(loadProfile)

  const resetState = () => {
    user.value = null
    posts.value = []
    postUI.cancelEdit()
    postUI.resetCommentsState()
  }

  const loadProfileWithReset = async () => {
    resetState()
    await loadProfile()
  }

  watch(
    () => routeId.value,
    () => loadProfileWithReset(),
    { immediate: true },
  )

  return {
    // auth/meta
    me,
    isAuthed,

    // data
    user,
    posts,

    // ui
    loadingProfile,

    // computed
    routeId,
    isMyProfile,
    initials,
    stats,

    // actions
    loadProfile: loadProfileWithReset,

    // (startEdit, deletePost, toggleLike, comments ...)
    ...postUI,
  }
}
