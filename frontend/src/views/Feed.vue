<script setup>
import { onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useFeed } from '../composables/useFeed'
import PostCard from '../components/feed/PostCard.vue'

const { me, isAuthed } = useAuth()

const {
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

  showComments,
  toggleComments,
  addComment,
  deleteComment,
} = useFeed()

onMounted(async () => {
  await loadPosts(false)
})
</script>

<template>
  <div class="space-y-5">
    <!-- Composer -->
    <div
      v-if="isAuthed"
      data-testid="create-post"
      class="rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div class="p-5">
        <div class="flex items-start gap-3">
          <div class="h-10 w-10 rounded-full bg-slate-200 grid place-items-center text-xs font-semibold">
            {{ (me?.username || 'ME').slice(0, 2).toUpperCase() }}
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
              <label class="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer">
                <input
                  data-testid="post-file"
                  ref="fileInput"
                  type="file"
                  class="hidden"
                  @change="onFileChange"
                />
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
        Bitte
        <RouterLink to="/login" class="text-slate-900 font-semibold hover:underline">einloggen</RouterLink>,
        um Posts zu erstellen, zu liken und zu kommentieren.
      </p>
    </div>

    <!-- Posts -->
    <TransitionGroup name="list" tag="div" class="space-y-5">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"

        :showOwnerActions="!!me?.id && post.user_id === me.id"
        :allowLike="!!isAuthed"                 
        :editing="editingPostId === post.id"
        :editedContent="editedContent"

        :showComments="!!showComments?.[post.id]"         
        :comments="commentsByPost?.[post.id] || []"      
        :newCommentText="newComment?.[post.id] || ''"     

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
    </TransitionGroup>

    <!-- Load more -->
    <div class="flex justify-center pt-2">
      <button
        v-if="hasMore"
        @click="loadPosts(true)"
        class="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition text-sm"
      >
        {{ loading ? 'Loading...' : 'Load more' }}
      </button>
    </div>
  </div>
</template>