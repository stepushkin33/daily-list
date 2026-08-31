<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import BaseModal from './BaseModal.vue'

withDefaults(
  defineProps<{
    cancelText?: string
    confirmText?: string
    message: string
    open: boolean
    title: string
    tone?: 'danger' | 'primary'
  }>(),
  {
    cancelText: 'Отмена',
    confirmText: 'Подтвердить',
    tone: 'primary',
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <div class="confirm-copy">
      <span class="confirm-icon" :class="{ 'confirm-icon-danger': tone === 'danger' }">
        <AppIcon :name="tone === 'danger' ? 'trash' : 'spark'" :size="21" />
      </span>
      <p>{{ message }}</p>
    </div>
    <template #footer>
      <button class="button button-ghost" type="button" @click="emit('close')">{{ cancelText }}</button>
      <button
        class="button"
        :class="tone === 'danger' ? 'button-danger' : 'button-dark'"
        type="button"
        data-autofocus
        @click="emit('confirm')"
      >
        {{ confirmText }}
        <AppIcon v-if="tone === 'primary'" name="arrow-right" :size="16" />
      </button>
    </template>
  </BaseModal>
</template>
