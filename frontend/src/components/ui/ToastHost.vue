<template>
  <div class="fixed bottom-4 right-4 z-[100] space-y-3 w-[340px] max-w-[92vw]">
    <TransitionGroup name="toast" tag="div" class="space-y-3">
      <div
        v-for="t in state.toasts"
        :key="t.id"
        class="rounded-2xl shadow-lg px-4 py-3 flex items-start justify-between gap-3 border"
        :class="cls(t)"
      >
        <div class="flex items-start gap-3">
          <span class="text-lg leading-none">{{ icon(t.type) }}</span>
          <p class="text-sm leading-snug">{{ t.message }}</p>
        </div>
        <button class="opacity-70 hover:opacity-100 text-sm" @click="remove(t.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from "../../ui/toast";
const { state, remove } = useToast();

const cls = (t) => {
  if (t.type === "error") return "bg-red-600 text-white border-red-500/30";
  if (t.type === "info") return "bg-slate-900 text-white border-white/10";
  if (t.type === "warn") return "bg-amber-500 text-white border-amber-400/30";
  return "bg-emerald-600 text-white border-emerald-500/30";
};

const icon = (type) => {
  if (type === "error") return "⛔";
  if (type === "info") return "ℹ️";
  if (type === "warn") return "⚠️";
  return "✅";
};
</script>

<style>
.toast-enter-active,
.toast-leave-active { transition: all 0.18s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
