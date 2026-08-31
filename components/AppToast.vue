<script setup lang="ts">
import { storeToRefs } from 'pinia'

import AppIcon from './AppIcon.vue'
import { useUiStore } from '../stores/ui'

const uiStore = useUiStore()
const { toast } = storeToRefs(uiStore)
</script>

<template>
  <Transition name="toast">
    <div v-if="toast" class="toast" :class="`toast-${toast.tone}`" role="status">
      <span class="toast-mark"><AppIcon :name="toast.tone === 'success' ? 'check' : 'close'" :size="14" /></span>
      <span>{{ toast.message }}</span>
      <button class="toast-close" type="button" aria-label="Закрыть уведомление" @click="uiStore.hideToast">
        <AppIcon name="close" :size="15" />
      </button>
    </div>
  </Transition>
</template>
