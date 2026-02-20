<script setup>
import { useConfirm } from "../ui/confirm";
const { state, confirm, cancel } = useConfirm();
</script>

<template>
  <div v-if="state.open" class="fixed inset-0 z-[120]">
    <!-- backdrop -->
    <div class="absolute inset-0 bg-black/40" @click="cancel"></div>

    <!-- modal -->
    <div class="absolute inset-0 grid place-items-center p-4">
      <div class="w-full max-w-md rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-slate-900">{{ state.title }}</h3>
          <p class="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{{ state.message }}</p>

          <div class="mt-6 flex justify-end gap-2">
            <button
              @click="cancel"
              class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
            >
              {{ state.cancelText }}
            </button>

            <button
              @click="confirm"
              class="px-4 py-2 rounded-xl text-white transition"
              :class="state.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-black'"
            >
              {{ state.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
