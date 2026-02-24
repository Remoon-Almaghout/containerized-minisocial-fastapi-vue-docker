import { reactive } from 'vue'

const state = reactive({
  toasts: [],
})

let id = 1

function removeById(toastId) {
  const idx = state.toasts.findIndex((x) => x.id === toastId)
  if (idx !== -1) state.toasts.splice(idx, 1)
}

export function useToast() {
  const push = (message, type = 'success', timeout = 2500) => {
    const t = { id: id++, message, type }
    state.toasts.push(t)

    window.setTimeout(() => {
      removeById(t.id)
    }, timeout)
  }

  const remove = (toastId) => {
    removeById(toastId)
  }

  return { state, push, remove }
}
