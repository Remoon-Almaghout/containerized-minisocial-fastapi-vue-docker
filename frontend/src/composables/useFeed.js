import { ref } from 'vue'
import { PostService } from '../services/post.service'
import { useToast } from '../ui/toast'
import { getErrorMessage } from '../utils/error.util'
import { useAuth } from './useAuth'
import { usePostInteractions } from './usePostInteractions'

export function useFeed() {
  const { push } = useToast()
  const { me, isAuthed } = useAuth()

  // feed state
  const posts = ref([])
  const loading = ref(false)
  const limit = ref(4)
  const offset = ref(0)
  const hasMore = ref(true)

  // composer state
  const content = ref('')
  const file = ref(null)
  const fileInput = ref(null)

  // ✅ refresh = reset + loadPosts
  const reset = () => {
    posts.value = []
    offset.value = 0
    hasMore.value = true
    postUI.resetCommentsState()
    postUI.cancelEdit()
  }

  const loadPosts = async (append = false) => {
    if (loading.value) return
    if (append && !hasMore.value) return

    loading.value = true
    try {
      const params = { limit: limit.value, offset: offset.value }
      const authed = !!isAuthed.value

      const res = await PostService.feed(params, authed)

      const newItems = res.data || []
      posts.value = append ? [...posts.value, ...newItems] : newItems

      if (newItems.length < limit.value) {
        hasMore.value = false
      } else {
        offset.value += limit.value
      }
    } catch (err) {
      push(getErrorMessage(err, 'Fehler beim Laden der Posts ❌'), 'error')
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const refresh = async () => {
    reset()
    await loadPosts(false)
  }

  // ✅ shared actions/state
  const postUI = usePostInteractions(refresh)

  const createPost = async () => {
    if (!isAuthed.value) return

    const text = content.value.trim()
    if (!text) {
      push('Content darf nicht leer sein ❌', 'error')
      return
    }

    try {
      const res = await PostService.create({ content: text })
      const postId = res.data?.id

      const hadFile = !!file.value
      if (hadFile && postId) {
        await PostService.uploadImage(postId, file.value)
      }

      // reset UI
      content.value = ''
      file.value = null
      if (fileInput.value) fileInput.value.value = ''

      await refresh()
      push(hadFile ? 'Post + Bild hochgeladen ✅' : 'Post erstellt ✅', 'success')
    } catch (err) {
      push(getErrorMessage(err, 'Fehler beim Erstellen des Posts ❌'), 'error')
      console.error(err)
    }
  }

  const onFileChange = (e) => {
    file.value = e.target.files?.[0] ?? null
  }

  return {
    me,
    isAuthed,

    // feed
    posts,
    loading,
    hasMore,

    // composer
    content,
    file,
    fileInput,
    onFileChange,

    // feed actions
    loadPosts,
    createPost,

    // ✅ ALLES aus usePostInteractions (deletePost, startEdit, saveEdit, toggleLike, comments, usw.)
    ...postUI,
  }
}
