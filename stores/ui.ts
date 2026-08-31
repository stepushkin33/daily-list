import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ToastMessage {
  id: number
  message: string
  tone: 'success' | 'error'
}

export const useUiStore = defineStore('ui', () => {
  const toast = ref<ToastMessage | null>(null)
  let toastTimer: ReturnType<typeof setTimeout> | null = null
  let toastId = 0

  const hideToast = (): void => {
    toast.value = null

    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
  }

  const showToast = (message: string, tone: ToastMessage['tone'] = 'success'): void => {
    hideToast()
    toastId += 1
    toast.value = { id: toastId, message, tone }
    toastTimer = setTimeout(hideToast, 4_500)
  }

  return {
    hideToast,
    showToast,
    toast,
  }
})
