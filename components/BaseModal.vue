<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import AppIcon from './AppIcon.vue'

const props = withDefaults(
  defineProps<{
    closeOnBackdrop?: boolean
    open: boolean
    title: string
  }>(),
  { closeOnBackdrop: true },
)

const emit = defineEmits<{
  close: []
}>()

const panel = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const focusInitialElement = (): void => {
  const root = panel.value

  if (!root) {
    return
  }

  const autofocusElement = root.querySelector<HTMLElement>('[data-autofocus]')
  const firstFocusable = root.querySelector<HTMLElement>(focusableSelector)
  ;(autofocusElement ?? firstFocusable ?? root).focus()
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const root = panel.value
  const focusableElements = root ? [...root.querySelectorAll<HTMLElement>(focusableSelector)] : []

  if (focusableElements.length === 0) {
    event.preventDefault()
    root?.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements.at(-1)

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement?.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement?.focus()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
      await nextTick()
      focusInitialElement()
    } else {
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  previouslyFocused?.focus()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @click.self="closeOnBackdrop && emit('close')">
        <section
          ref="panel"
          class="modal-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
          @keydown="handleKeydown"
        >
          <div class="modal-heading">
            <h2>{{ title }}</h2>
            <button class="icon-button" type="button" aria-label="Закрыть окно" @click="emit('close')">
              <AppIcon name="close" :size="18" />
            </button>
          </div>
          <div class="modal-content">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
