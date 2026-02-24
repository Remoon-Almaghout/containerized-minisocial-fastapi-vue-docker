import { ref } from 'vue'
import { PostService } from '../services/post.service'
import { useToast } from '../ui/toast'
import { useConfirm } from '../ui/confirm'
import { getErrorMessage } from '../utils/error.util'
import { useAuth } from './useAuth'

export function usePostInteractions(refresh) {
  const { push } = useToast()
  const { ask } = useConfirm()
  const { isAuthed } = useAuth()

  // editing state
  const editingPostId = ref(null)
  const editedContent = ref('')

  // comments state
  const commentsByPost = ref({})
  const newComment = ref({})
  const showComments = ref({})

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
      push('Content/Text darf nicht leer sein ❌', 'error')
      return
    }

    try {
      await PostService.update(postId, { content: text })
      push('Post aktualisiert ✅', 'success')
      cancelEdit()
      await refresh()
    } catch (err) {
      push(getErrorMessage(err, 'Update fehlgeschlagen ❌'), 'error')
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
      await refresh()
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
      // rollback
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

  const resetCommentsState = () => {
    commentsByPost.value = {}
    newComment.value = {}
    showComments.value = {}
  }

  return {
    // editing
    editingPostId,
    editedContent,
    startEdit,
    cancelEdit,
    saveEdit,

    // actions
    deletePost,
    toggleLike,

    // comments
    commentsByPost,
    newComment,
    showComments,
    loadComments,
    toggleComments,
    addComment,
    deleteComment,

    // helper
    resetCommentsState,
  }
}
