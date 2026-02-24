import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '../ui/toast'
import { useConfirm } from '../ui/confirm'
import { useAuth } from './useAuth'
import { PostService } from '../services/post.service'
import { UserService } from '../services/user.service'
import { getErrorMessage } from '../utils/error.util'

export function useProfile() {
  const { push } = useToast()
  const { ask } = useConfirm()
  const { me, isAuthed } = useAuth()
  const route = useRoute()

  // data
  const user = ref(null)
  const posts = ref([])

  // ui state
  const loadingProfile = ref(false)
  const editingPostId = ref(null)
  const editedContent = ref('')

  // comments state
  const commentsByPost = ref({})
  const showComments = ref({})
  const newComment = ref({})

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
  const resetState = () => {
    user.value = null
    posts.value = []
    editingPostId.value = null
    editedContent.value = ''
    showComments.value = {}
    commentsByPost.value = {}
    newComment.value = {}
  }

  const loadProfile = async () => {
    const id = routeId.value
    loadingProfile.value = true
    resetState()

    try {
      const [u, p] = await Promise.all([UserService.get(id), UserService.posts(id)])
      user.value = u.data
      posts.value = p.data || []
    } catch (err) {
      resetState()
      push(getErrorMessage(err, 'Profil konnte nicht geladen werden ❌'), 'error')
      console.error(err)
    } finally {
      loadingProfile.value = false
    }
  }

  const startEdit = (post) => {
    editingPostId.value = post.id
    editedContent.value = post.content
  }

  const cancelEdit = () => {
    editingPostId.value = null
    editedContent.value = ''
  }

  const saveEdit = async (postId) => {
    const text = editedContent.value.trim()
    if (!text) {
      push('Text darf nicht leer sein ❌', 'error')
      return
    }

    try {
      await PostService.update(postId, { content: text })
      push('Post aktualisiert ✅', 'success')
      cancelEdit()
      await loadProfile()
    } catch (err) {
      push(getErrorMessage(err, 'Speichern fehlgeschlagen ❌'), 'error')
      console.error(err)
    }
  }

  const deletePost = async (postId) => {
    const ok = await ask({
      title: 'Post löschen?',
      message: 'Willst du diesen Post wirklich löschen? Das kann nicht rückgängig gemacht werden.',
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      danger: true,
    })
    if (!ok) return

    try {
      await PostService.remove(postId)
      push('Post gelöscht 🗑️', 'success')
      await loadProfile()
    } catch (err) {
      push(getErrorMessage(err, 'Löschen fehlgeschlagen ❌'), 'error')
      console.error(err)
    }
  }

  // --- Comments ---
  const loadComments = async (postId) => {
    try {
      const res = await PostService.comments(postId)
      commentsByPost.value[postId] = res.data || []
    } catch (err) {
      push(getErrorMessage(err, 'Kommentare konnten nicht geladen werden ❌'), 'error')
      console.error(err)
    }
  }

  const toggleComments = async (postId) => {
    showComments.value[postId] = !showComments.value[postId]

    const hasLoaded = Object.prototype.hasOwnProperty.call(commentsByPost.value, postId)
    if (showComments.value[postId] && !hasLoaded) {
      await loadComments(postId)
    }
  }

  const addComment = async (postId) => {
    if (!isAuthed.value) return

    const text = (newComment.value[postId] || '').trim()
    if (!text) return

    try {
      await PostService.addComment(postId, { content: text })
      newComment.value[postId] = ''
      push('Kommentar hinzugefügt 💬', 'success')
      await loadComments(postId)
    } catch (err) {
      push(getErrorMessage(err, 'Kommentar fehlgeschlagen ❌'), 'error')
      console.error(err)
    }
  }

  const deleteComment = async (commentId, postId) => {
    const ok = await ask({
      title: 'Kommentar löschen?',
      message: 'Diesen Kommentar wirklich löschen?',
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      danger: true,
    })
    if (!ok) return

    try {
      await PostService.deleteComment(commentId)
      push('Kommentar gelöscht 🗑️', 'success')
      await loadComments(postId)
    } catch (err) {
      push(getErrorMessage(err, 'Löschen fehlgeschlagen ❌'), 'error')
      console.error(err)
    }
  }

  const toggleLike = async (post) => {
    if (!isAuthed.value) return

    const wasLiked = !!post.liked_by_me
    post.liked_by_me = !wasLiked
    post.likes_count = Math.max(0, (post.likes_count || 0) + (wasLiked ? -1 : 1))

    try {
      if (wasLiked) await PostService.unlike(post.id)
      else await PostService.like(post.id)
    } catch (err) {
      post.liked_by_me = wasLiked
      post.likes_count = Math.max(0, (post.likes_count || 0) + (wasLiked ? 1 : -1))
      push(getErrorMessage(err, 'Like fehlgeschlagen ❌'), 'error')
      console.error(err)
    }
  }

  watch(
    () => routeId.value,
    () => loadProfile(),
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
    editingPostId,
    editedContent,

    // comments
    commentsByPost,
    showComments,
    newComment,

    // computed
    routeId,
    isMyProfile,
    initials,
    stats,

    // actions
    loadProfile,
    startEdit,
    cancelEdit,
    saveEdit,
    deletePost,
    toggleComments,
    addComment,
    deleteComment,
    toggleLike,
  }
}
