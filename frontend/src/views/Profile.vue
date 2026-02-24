<script setup>
import PostCard from '../components/feed/PostCard.vue'
import { useProfile } from '../composables/useProfile'

const {
  me,
  isAuthed,
  user,
  posts,
  loadingProfile,
  editingPostId,
  editedContent,
  commentsByPost,
  showComments,
  newComment,
  isMyProfile,
  initials,
  stats,
  startEdit,
  deletePost,
  saveEdit,
  cancelEdit,
  toggleLike,
  toggleComments,
  addComment,
  deleteComment,
} = useProfile()
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
        </div>
      </section>
    </template>
  </div>
</template>