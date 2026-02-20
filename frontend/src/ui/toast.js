import { reactive } from 'vue'

const state = reactive({
  toasts: [],
})

let id = 1

export function useToast() {
  const push = (message, type = 'success', timeout = 2500) => {
    const t = { id: id++, message, type }
    state.toasts.push(t)

    window.setTimeout(() => {
      state.toasts = state.toasts.filter((x) => x.id !== t.id)
    }, timeout)
  }

  const remove = (toastId) => {
    state.toasts = state.toasts.filter((x) => x.id !== toastId)
  }

  return { state, push, remove }
}
