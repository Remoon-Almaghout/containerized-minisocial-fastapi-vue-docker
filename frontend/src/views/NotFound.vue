<template>
  <div class="text-center py-16">
    <div
      class="mx-auto mb-6 h-16 w-16 rounded-2xl bg-slate-900 text-white grid place-items-center text-xl font-bold"
    >
      404
    </div>

    <h1 class="text-2xl font-semibold mb-2">Page not found</h1>
    <p class="text-slate-500 mb-6">
      The page you are looking for does not exist or was moved.
    </p>

    <div class="flex justify-center gap-3">
      <RouterLink
        to="/feed"
        class="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
      >
        Go to Feed
      </RouterLink>

      <RouterLink
        to="/login"
        class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
      >
        Login
      </RouterLink>
    </div>
  </div>
</template>