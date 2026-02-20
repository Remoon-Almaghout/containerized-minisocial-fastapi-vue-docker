<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import api from "../api/client";
import { me, isAuthed } from "../auth";
import { useToast } from "../ui/toast";

const { push } = useToast();

const route = useRoute();
const user = ref(null);
const posts = ref([]);

const editingPostId = ref(null);
const editedContent = ref("");

const commentsByPost = ref({});
const showComments = ref({}); // postId -> bool

const isMyProfile = computed(() => {
  return isAuthed.value && me.value && String(me.value.id) === String(route.params.id);
});

const initials = computed(() => {
  const name = user.value?.username || "User";
  return name.slice(0, 2).toUpperCase();
});

const stats = computed(() => {
  const totalPosts = posts.value.length;
  const likes = posts.value.reduce((acc, p) => acc + (p.likes_count ?? 0), 0);
  const comments = posts.value.reduce((acc, p) => acc + (p.comments_count ?? 0), 0);
  return { totalPosts, likes, comments };
});

const loadProfile = async () => {
  const id = route.params.id;

  const u = await api.get(`/users/${id}`);
  user.value = u.data;

  const p = await api.get(`/users/${id}/posts`);
  posts.value = p.data;
};

const startEdit = (post) => {
  editingPostId.value = post.id;
  editedContent.value = post.content;
};

const cancelEdit = () => {
  editingPostId.value = null;
  editedContent.value = "";
};

const saveEdit = async (postId) => {
  await api.put(`/posts/${postId}`, { content: editedContent.value });
  push("Post aktualisiert ✅", "success");
  editingPostId.value = null;
  editedContent.value = "";
  await loadProfile();
};

const deletePost = async (postId) => {
  if (!confirm("Post wirklich löschen?")) return;
  await api.delete(`/posts/${postId}`);
  push("Post gelöscht ✅", "success");
  await loadProfile();
};

const loadComments = async (postId) => {
  const res = await api.get(`/posts/${postId}/comments`);
  commentsByPost.value[postId] = res.data;
};

const toggleComments = async (postId) => {
  showComments.value[postId] = !showComments.value[postId];
  if (showComments.value[postId] && !commentsByPost.value[postId]) {
    await loadComments(postId);
  }
};

onMounted(loadProfile);
</script>

<template>
  <div class="space-y-5">
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
            <h2 class="text-2xl font-semibold">{{ user?.username }}</h2>
            <p class="text-sm text-slate-500">User ID: {{ user?.id }}</p>
          </div>
        </div>

        <div v-if="isMyProfile" class="text-sm text-slate-600">
          <span class="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200">
            This is you
          </span>
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

      <div v-if="posts.length === 0" class="text-slate-500 mt-4">
        No posts yet.
      </div>

      <div class="mt-4 space-y-4">
        <div
          v-for="post in posts"
          :key="post.id"
          class="rounded-3xl border border-slate-200 bg-slate-50 p-5"
        >
          <div class="flex items-start justify-between gap-3">
            <!-- content -->
            <div class="flex-1">
              <p v-if="editingPostId !== post.id" class="text-sm text-slate-800 whitespace-pre-wrap">
                {{ post.content }}
              </p>

              <div v-else class="space-y-3">
                <textarea
                  v-model="editedContent"
                  class="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
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
                    class="px-4 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- owner actions -->
            <div v-if="isMyProfile && editingPostId !== post.id" class="flex gap-2">
              <button
                @click="startEdit(post)"
                class="px-3 py-2 rounded-xl text-sm border border-slate-200 hover:bg-white transition"
              >
                Edit
              </button>
              <button
                @click="deletePost(post.id)"
                class="px-3 py-2 rounded-xl text-sm border border-red-200 text-red-600 hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </div>

          <img
            v-if="post.image_path"
            :src="'http://localhost:8000' + post.image_path"
            class="rounded-2xl mt-4 w-full border border-slate-200"
          />

          <!-- counts -->
          <div class="flex items-center gap-4 mt-4 text-sm text-slate-600">
            <span>❤️ {{ post.likes_count ?? 0 }}</span>
            <button class="hover:underline" @click="toggleComments(post.id)">
              💬 {{ post.comments_count ?? 0 }}
            </button>
          </div>

          <!-- comments preview -->
          <div v-if="showComments[post.id]" class="mt-4 space-y-2">
            <div
              v-for="c in (commentsByPost[post.id] || []).slice(0, 3)"
              :key="c.id"
              class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              {{ c.content }}
            </div>

            <p v-if="(commentsByPost[post.id] || []).length === 0" class="text-sm text-slate-500">
              No comments yet.
            </p>

            <p v-if="(commentsByPost[post.id] || []).length > 3" class="text-xs text-slate-500">
              Showing latest 3 comments.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
