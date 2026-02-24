<script setup>
import { computed } from 'vue'
import { API_BASE } from '../../api/config'
import { useAuth } from '../../composables/useAuth'

const { me, isAuthed } = useAuth()

const props = defineProps({
  post: { type: Object, required: true },

  // flags
  showOwnerActions: { type: Boolean, default: false },
  allowLike: { type: Boolean, default: false },

  // comments
  comments: { type: Array, default: () => [] },
  showComments: { type: Boolean, default: false },
  newCommentText: { type: String, default: '' },

  // editing
  editing: { type: Boolean, default: false },
  editedContent: { type: String, default: '' },
})

const emit = defineEmits([
  'edit',
  'delete',
  'save',
  'cancel',
  'toggle-like',
  'toggle-comments',
  'update:editedContent',
  'update:newCommentText',
  'add-comment',
  'delete-comment',
])
const isLoggedIn = computed(() => !!isAuthed.value)

const initials = computed(() => {
  const name = props.post.username || 'U' + props.post.user_id
  return String(name).slice(0, 2).toUpperCase()
})

const canDeleteComment = (c) => {
  return !!me.value?.id && c.user_id === me.value.id
}

const imageUrl = computed(() => {
  if (!props.post.image_path) return ''
  const base = String(API_BASE || '').replace(/\/+$/, '')
  const path = String(props.post.image_path || '').startsWith('/')
    ? props.post.image_path
    : `/${props.post.image_path}`
  return base + path
})
</script>

<template>
  <article class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="p-5 flex items-start justify-between gap-4">
      <div class="flex items-start gap-3">
        <div class="h-10 w-10 rounded-full bg-slate-200 grid place-items-center text-xs font-semibold">
          {{ initials }}
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
      <div v-if="showOwnerActions" class="flex items-center gap-2">
        <button
          v-if="!editing"
          @click="emit('edit', post)"
          class="px-3 py-2 rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition"
        >
          Edit
        </button>
        <button
          v-if="!editing"
          @click="emit('delete', post.id)"
          class="px-3 py-2 rounded-xl text-sm border border-red-200 text-red-600 hover:bg-red-50 transition"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="px-5 pb-4">
      <div v-if="!editing">
        <p class="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
          {{ post.content }}
        </p>
      </div>

      <div v-else class="space-y-3">
        <textarea
          :value="editedContent"
          @input="emit('update:editedContent', $event.target.value)"
          class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          rows="3"
        />
        <div class="flex gap-2">
          <button
            @click="emit('save', post.id)"
            class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition"
          >
            Save
          </button>
          <button
            @click="emit('cancel')"
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
        :src="imageUrl"
        class="rounded-2xl w-full max-h-[520px] object-cover border border-slate-200"
        alt="Post image"
      />
    </div>

    <!-- Actions -->
    <div class="px-5 pb-5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          v-if="allowLike"
          @click="emit('toggle-like', post)"
          class="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-sm"
        >
          <span class="mr-1">{{ post.liked_by_me ? '❤️' : '🤍' }}</span>
          {{ post.liked_by_me ? 'Unlike' : 'Like' }}
        </button>

        <span class="text-sm text-slate-500">
          {{ post.likes_count ?? 0 }} likes
        </span>
      </div>

      <button
        class="px-3 py-2 rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition"
        @click.stop="emit('toggle-comments', post.id)"
      >
        Comments
      </button>
    </div>

    <!-- Comments -->
    <div v-if="showComments" class="border-t border-slate-200 bg-slate-50/60">
      <div class="p-5 space-y-3">
        <div v-if="(comments || []).length === 0" class="text-sm text-slate-500">
          No comments yet.
        </div>

        <div class="space-y-2">
          <div
            v-for="c in comments"
            :key="c.id ?? c.comment_id ?? `${post.id}-${c.created_at ?? c.content}`"
            class="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-start justify-between gap-3"
          >
            <p class="text-sm text-slate-800">{{ c.content }}</p>

            <button
              v-if="canDeleteComment(c)"
              @click="emit('delete-comment', c.id ?? c.comment_id, post.id)"
              class="text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- add comment -->
        <div class="pt-2" v-if="isLoggedIn">
          <div class="flex gap-2">
            <input
              :value="newCommentText"
              @input="emit('update:newCommentText', $event.target.value)"
              class="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="Write a comment…"
            />
            <button
              @click="emit('add-comment', post.id)"
              class="px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
            >
              Send
            </button>
          </div>
        </div>

        <p v-else class="text-sm text-slate-500">
          Bitte
          <RouterLink to="/login" class="text-slate-900 font-semibold hover:underline">einloggen</RouterLink>,
          um zu kommentieren.
        </p>
      </div>
    </div>
  </article>
</template>