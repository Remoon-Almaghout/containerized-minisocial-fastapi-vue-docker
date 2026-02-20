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

export function useConfirm() {
  const ask = ({ title, message, confirmText, cancelText, danger } = {}) => {
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

  const confirm = () => {
    state.open = false
    state._resolve?.(true)
    state._resolve = null
  }

  const cancel = () => {
    state.open = false
    state._resolve?.(false)
    state._resolve = null
  }

  return { state, ask, confirm, cancel }
}
