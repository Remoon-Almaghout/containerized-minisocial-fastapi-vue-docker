<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/client'
import { useToast } from "../ui/toast";
import { useConfirm } from "../ui/confirm";
import  { API_BASE } from "../api/config"

const { push } = useToast();
const { ask } = useConfirm();

const posts = ref([])
const content = ref('')
const file = ref(null)
const fileInput = ref(null);
const me = ref(null)
const editingPostId = ref(null)
const editedContent = ref('')
const commentsByPost = ref({})
const newComment = ref({}) // key: postId -> text
const AUTO_LOAD_COMMENTS_FOR_FIRST = 3
const limit = ref(4)
const offset = ref(0)
const hasMore = ref(true)
const loading = ref(false)

const resetFeed = () => {
  posts.value = []
  offset.value = 0
  hasMore.value = true
}

const loadPosts = async (append = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const token = localStorage.getItem("access_token")
    const endpoint = token ? "/posts/me-feed" : "/posts"
    const res = await api.get(endpoint, {
      params: { limit: limit.value, offset: offset.value },
    })

    const newItems = res.data || []
    if (append) posts.value = [...posts.value, ...newItems]
    else posts.value = newItems

    // if fewer than limit returned => no more
    if (newItems.length < limit.value) hasMore.value = false
    else offset.value += limit.value

    // Auto-load comments for first N (only first page OR when not append)
    if (!append) {
      const first = posts.value.slice(0, AUTO_LOAD_COMMENTS_FOR_FIRST)
      await Promise.all(first.map(p => loadComments(p.id)))
    }
  } finally {
    loading.value = false
  }
}

const createPost = async () => {
  if (!me.value) return;

  try {
    const res = await api.post('/posts', { content: content.value })

    if (file.value) {
      const formData = new FormData()
      formData.append('file', file.value)

      await api.post(`/posts/${res.data.id}/image`, formData)
    }

    const hadFile = !!file.value

    content.value = ''
    file.value = null
    if (fileInput.value) fileInput.value.value = ""

    resetFeed()
    await loadPosts(false)

    push(hadFile ? "Post + Bild hochgeladen ✅" : "Post erstellt ✅", "success")

  } catch (err) {
    push("Fehler beim Erstellen des Posts ❌", "error")
    console.error(err)
  }
}

const deletePost = async (id) => {
  const ok = await ask({
    title: "Post löschen?",
    message: "Willst du diesen Post wirklich löschen? Das kann nicht rückgängig gemacht werden.",
    confirmText: "Löschen",
    cancelText: "Abbrechen",
    danger: true,
  });
  if (!ok) return;

  await api.delete(`/posts/${id}`);
  push("Post gelöscht 🗑️", "success");

  resetFeed();
  await loadPosts(false);
};

const onFileChange = (e) => {
  file.value = e.target.files?.[0] ?? null
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
  await api.put(`/posts/${id}`, { content: editedContent.value });
  editingPostId.value = null;
  editedContent.value = "";
  resetFeed();
  await loadPosts(false);
  push("Post aktualisiert ✅", "success");
};

const loadMe = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    me.value = null
    return
  }

  try {
    const res = await api.get('/auth/me')
    me.value = res.data
  } catch {
    me.value = null
  }
}

const toggleLike = async (post) => {
  if (!me.value) return;

  const wasLiked = post.liked_by_me

  post.liked_by_me = !wasLiked
  post.likes_count += wasLiked ? -1 : 1

  try {
    if (wasLiked) {
      await api.delete(`/posts/${post.id}/like`)
    } else {
      await api.post(`/posts/${post.id}/like`)
    }
  } catch (err) {
    // Rollback
    post.liked_by_me = wasLiked
    post.likes_count += wasLiked ? 1 : -1
  }
}

const loadComments = async (postId) => {
  const res = await api.get(`/posts/${postId}/comments`)
  commentsByPost.value[postId] = res.data
}

const addComment = async (postId) => {
  if (!me.value) return;
  const text = newComment.value[postId];
  if (!text) return;

  await api.post(`/posts/${postId}/comments`, { content: text });
  push("Kommentar hinzugefügt 💬", "success");
  newComment.value[postId] = "";
  await loadComments(postId);
};

const deleteComment = async (commentId, postId) => {
  const ok = await ask({
    title: "Kommentar löschen?",
    message: "Diesen Kommentar wirklich löschen?",
    confirmText: "Löschen",
    cancelText: "Abbrechen",
    danger: true,
  });
  if (!ok) return;

  await api.delete(`/posts/comments/${commentId}`);
  push("Kommentar gelöscht 🗑️", "success");
  await loadComments(postId);
};



onMounted(async () => {
  await loadMe()
  await loadPosts()
})
</script>

<template>
  <div class="space-y-5">
    <!-- Composer -->
    <div v-if="me" data-testid="create-post" class="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div class="p-5">
        <div class="flex items-start gap-3">
          <div class="h-10 w-10 rounded-full bg-slate-200 grid place-items-center text-xs font-semibold">
            {{ (me?.username || "ME").slice(0,2).toUpperCase() }}
          </div>

          <div class="flex-1">
            <textarea
              data-testid="post-content"
              v-model="content"
              placeholder="What's on your mind?"
              class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              rows="3"
            />

            <div class="mt-3 flex items-center justify-between gap-3">
              <label
                class="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <input data-testid="post-file" ref="fileInput" type="file" class="hidden" @change="onFileChange" />
                <span class="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">
                  Add image
                </span>
                <span v-if="file" class="text-xs text-slate-500 truncate max-w-[180px]">
                  {{ file?.name }}
                </span>
              </label>

              <button
                data-testid="post-submit"
                @click="createPost"
                class="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
      <p class="text-sm text-slate-600">
        Bitte <RouterLink to="/login" class="text-slate-900 font-semibold hover:underline">einloggen</RouterLink>,
        um Posts zu erstellen, zu liken und zu kommentieren.
      </p>
    </div>

    <!-- Posts -->
    <TransitionGroup name="list" tag="div" class="space-y-5">
      <article
        v-for="post in posts"
        :key="post.id"
        class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      >
        <!-- Header -->
        <div class="p-5 flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="h-10 w-10 rounded-full bg-slate-200 grid place-items-center text-xs font-semibold">
              {{ (post.username || ("U" + post.user_id)).slice(0,2).toUpperCase() }}
            </div>

            <div class="leading-tight">
              <RouterLink
                :to="`/profile/${post.user_id}`"
                class="text-sm font-semibold text-slate-900 hover:underline"
              >
                {{ post.username ? post.username : `User #${post.user_id}` }}
              </RouterLink>
              <p class="text-xs text-slate-500">Post #{{ post.id }}</p>
            </div>
          </div>

          <!-- Owner actions -->
          <div v-if="me && post.user_id === me.id" class="flex items-center gap-2">
            <button
              v-if="editingPostId !== post.id"
              @click="startEdit(post)"
              class="px-3 py-2 rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition"
            >
              Edit
            </button>
            <button
              v-if="editingPostId !== post.id"
              @click="deletePost(post.id)"
              class="px-3 py-2 rounded-xl text-sm border border-red-200 text-red-600 hover:bg-red-50 transition"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-5 pb-4">
          <div v-if="editingPostId !== post.id">
            <p class="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {{ post.content }}
            </p>
          </div>

          <div v-else class="space-y-3">
            <textarea
              v-model="editedContent"
              class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              rows="3"
            />
            <div class="flex gap-2">
              <button
                @click="saveEdit(post.id)"
                class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition"
              >
                Save
              </button>
              <button
                @click="cancelEdit"
                class="px-4 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Image -->
        <div v-if="post.image_path" class="px-5 pb-5">
          <img
            :src="API_BASE + post.image_path"
            class="rounded-2xl w-full max-h-[520px] object-cover border border-slate-200"
          />
        </div>

        <!-- Actions -->
        <div class="px-5 pb-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              v-if="me"
              @click="toggleLike(post)"
              class="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-sm"
            >
              <span class="mr-1">{{ post.liked_by_me ? "❤️" : "🤍" }}</span>
              {{ post.liked_by_me ? "Unlike" : "Like" }}
            </button>

            <span class="text-sm text-slate-500">
              {{ post.likes_count ?? 0 }} likes
            </span>

            <span v-if="!me" class="text-xs text-slate-400">
              (Login to like)
            </span>
          </div>

          <button
            class="px-3 py-2 rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition"
            @click="loadComments(post.id)"
          >
            Comments
          </button>
        </div>

        <!-- Comments -->
        <div class="border-t border-slate-200 bg-slate-50/60">
          <div class="p-5 space-y-3">
            <div v-if="(commentsByPost[post.id] || []).length === 0" class="text-sm text-slate-500">
              No comments yet.
            </div>

            <div class="space-y-2">
              <div
                v-for="c in commentsByPost[post.id] || []"
                :key="c.id"
                class="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-start justify-between gap-3"
              >
                <p class="text-sm text-slate-800">{{ c.content }}</p>

                <button
                  v-if="me && c.user_id === me.id"
                  @click="deleteComment(c.id, post.id)"
                  class="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>

            <div class="pt-2">
              <div v-if="me" class="flex gap-2">
                <input
                  v-model="newComment[post.id]"
                  class="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Write a comment…"
                />
                <button
                  @click="addComment(post.id)"
                  class="px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
                >
                  Send
                </button>
              </div>

              <p v-else class="text-sm text-slate-500">
                Bitte <RouterLink to="/login" class="text-slate-900 font-semibold hover:underline">einloggen</RouterLink>,
                um zu kommentieren.
              </p>
            </div>
          </div>
        </div>
      </article>
    </TransitionGroup>

    <!-- Load more -->
    <div class="flex justify-center pt-2">
      <button
        v-if="hasMore"
        @click="loadPosts(true)"
        class="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition text-sm"
      >
        {{ loading ? "Loading..." : "Load more" }}
      </button>
    </div>
  </div>
</template>
