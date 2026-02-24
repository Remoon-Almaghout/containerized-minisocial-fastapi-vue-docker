<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '../ui/toast'
import { useConfirm } from '../ui/confirm'
import { useAuth } from '../composables/useAuth'
import { PostService } from '../services/post.service'
import { UserService } from '../services/user.service'
import { getErrorMessage } from '../utils/error.util'
import PostCard from '../components/feed/PostCard.vue'

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
const loadProfile = async () => {
  const id = routeId.value
  loadingProfile.value = true

  user.value = null
  posts.value = []
  editingPostId.value = null
  editedContent.value = ''
  showComments.value = {}
  commentsByPost.value = {}
  newComment.value = {}

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
</script>

<template>
  <div class="space-y-5">
    <!-- Loading state -->
    <div v-if="loadingProfile" class="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
      <div class="animate-pulse space-y-4">
        <div class="h-6 w-48 bg-slate-200 rounded"></div>
        <div class="h-4 w-32 bg-slate-200 rounded"></div>
        <div class="grid grid-cols-3 gap-3 pt-4">
          <div class="h-20 bg-slate-100 border border-slate-200 rounded-2xl"></div>
          <div class="h-20 bg-slate-100 border border-slate-200 rounded-2xl"></div>
          <div class="h-20 bg-slate-100 border border-slate-200 rounded-2xl"></div>
        </div>
      </div>
    </div>

    <!-- Not found / no user -->
    <div v-else-if="!user" class="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
      <h2 class="text-lg font-semibold">User not found</h2>
      <p class="text-sm text-slate-500 mt-1">
        Dieser Benutzer existiert nicht (oder konnte nicht geladen werden).
      </p>
    </div>

    <!-- Profile -->
    <template v-else>
      <!-- Banner -->
      <section class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="h-24 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900"></div>

        <div class="p-6 -mt-10 flex items-end justify-between gap-4">
          <div class="flex items-end gap-4">
            <div class="h-20 w-20 rounded-3xl bg-white border border-slate-200 shadow-sm grid place-items-center">
              <div class="h-14 w-14 rounded-2xl bg-slate-200 grid place-items-center font-semibold">
                {{ initials }}
              </div>
            </div>

            <div class="pb-1">
              <h2 class="text-2xl font-semibold">{{ user.username }}</h2>
              <p class="text-sm text-slate-500">User ID: {{ user.id }}</p>
            </div>
          </div>

          <div v-if="isMyProfile" class="text-sm text-slate-600">
            <span class="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200">This is you</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="px-6 pb-6">
          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs text-slate-500">Posts</p>
              <p class="text-xl font-semibold">{{ stats.totalPosts }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs text-slate-500">Likes received</p>
              <p class="text-xl font-semibold">{{ stats.likes }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs text-slate-500">Comments received</p>
              <p class="text-xl font-semibold">{{ stats.comments }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Posts -->
      <section class="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Posts</h3>
          <span class="text-sm text-slate-500">{{ posts.length }} total</span>
        </div>

        <div v-if="posts.length === 0" class="text-slate-500 mt-4">No posts yet.</div>

        <div v-else class="mt-4 space-y-4">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :showOwnerActions="isMyProfile"
            :allowLike="!!me?.id"
            :editing="editingPostId === post.id"
            :editedContent="editedContent"
            :showComments="!!showComments[post.id]"
            :comments="commentsByPost[post.id] || []"
            :newCommentText="newComment[post.id] || ''"
            @edit="startEdit"
            @delete="deletePost"
            @save="saveEdit"
            @cancel="cancelEdit"
            @toggle-like="toggleLike"
            @toggle-comments="toggleComments"
            @update:editedContent="editedContent = $event"
            @update:newCommentText="newComment[post.id] = $event"
            @add-comment="addComment"
            @delete-comment="deleteComment"
          />
        </div>
      </section>
    </template>
  </div>
</template>