import { reactive } from 'vue'

const state = reactive({
  open: false,
  title: 'Confirm',
  message: '',
  confirmText: 'Yes',
  cancelText: 'Cancel',
  danger: false,
  _resolve: null,
})

function safeResolve(val) {
  const r = state._resolve
  state._resolve = null
  state.open = false
  r?.(val)
}

export function useConfirm() {
  const ask = ({ title, message, confirmText, cancelText, danger } = {}) => {
    if (state.open && state._resolve) {
      safeResolve(false)
    }

    state.title = title || 'Confirm'
    state.message = message || ''
    state.confirmText = confirmText || 'Yes'
    state.cancelText = cancelText || 'Cancel'
    state.danger = !!danger
    state.open = true

    return new Promise((resolve) => {
      state._resolve = resolve
    })
  }

  const confirm = () => safeResolve(true)
  const cancel = () => safeResolve(false)

  return { state, ask, confirm, cancel }
}
