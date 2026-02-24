import { ref } from 'vue'
import { PostService } from '../services/post.service'
import { useToast } from '../ui/toast'
import { useConfirm } from '../ui/confirm'
import { getErrorMessage } from '../utils/error.util'
import { useAuth } from './useAuth'

export function useFeed() {
  const { push } = useToast()
  const { ask } = useConfirm()
  const { isAuthed } = useAuth()

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

  // editing state
  const editingPostId = ref(null)
  const editedContent = ref('')

  // comments state
  const commentsByPost = ref({})
  const newComment = ref({})
  const showComments = ref({})

  const reset = () => {
    posts.value = []
    offset.value = 0
    hasMore.value = true

    showComments.value = {}
    commentsByPost.value = {}
    newComment.value = {}
  }

  const loadPosts = async (append = false) => {
    // ✅ klare, korrekte Guards
    if (loading.value) return
    if (append && !hasMore.value) return

    loading.value = true
    try {
      const params = { limit: limit.value, offset: offset.value }
      const authed = !!isAuthed.value // ✅ boolean

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

      reset()
      await loadPosts(false)

      push(hadFile ? 'Post + Bild hochgeladen ✅' : 'Post erstellt ✅', 'success')
    } catch (err) {
      push(getErrorMessage(err, 'Fehler beim Erstellen des Posts ❌'), 'error')
      console.error(err)
    }
  }

  const deletePost = async (id) => {
    const ok = await ask({
      title: 'Post löschen?',
      message: 'Willst du diesen Post wirklich löschen?',
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      danger: true,
    })
    if (!ok) return

    try {
      await PostService.remove(id)
      push('Post gelöscht 🗑️', 'success')
      reset()
      await loadPosts(false)
    } catch (err) {
      push(getErrorMessage(err, 'Fehler beim Löschen ❌'), 'error')
      console.error(err)
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

  const saveEdit = async (id) => {
    try {
      const text = editedContent.value.trim()
      if (!text) {
        push('Content darf nicht leer sein ❌', 'error')
        return
      }

      await PostService.update(id, { content: text })

      editingPostId.value = null
      editedContent.value = ''

      reset()
      await loadPosts(false)

      push('Post aktualisiert ✅', 'success')
    } catch (err) {
      push(getErrorMessage(err, 'Update fehlgeschlagen ❌'), 'error')
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

  const loadComments = async (postId) => {
    try {
      const res = await PostService.comments(postId)
      const data = res.data
      commentsByPost.value[postId] = Array.isArray(data) ? data : data?.items || []
    } catch (err) {
      push(getErrorMessage(err, 'Kommentare konnten nicht geladen werden ❌'), 'error')
      console.error(err)
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

  const onFileChange = (e) => {
    file.value = e.target.files?.[0] ?? null
  }

  const toggleComments = async (postId) => {
    showComments.value[postId] = !showComments.value[postId]

    const hasLoaded = Object.prototype.hasOwnProperty.call(commentsByPost.value, postId)
    if (showComments.value[postId] && !hasLoaded) {
      await loadComments(postId)
    }
  }

  return {
    posts,
    loading,
    hasMore,

    content,
    file,
    fileInput,
    onFileChange,

    editingPostId,
    editedContent,

    commentsByPost,
    newComment,

    loadPosts,
    createPost,
    deletePost,

    startEdit,
    cancelEdit,
    saveEdit,

    toggleLike,

    loadComments,
    addComment,
    deleteComment,

    showComments,
    toggleComments,
  }
}
