<script setup lang="ts">
withDefaults(
  defineProps<{
    name:
      | 'arrow-left'
      | 'arrow-right'
      | 'check'
      | 'close'
      | 'edit'
      | 'plus'
      | 'redo'
      | 'search'
      | 'spark'
      | 'trash'
      | 'undo'
    size?: number
  }>(),
  { size: 20 },
)
</script>

<template>
  <svg
    :aria-hidden="true"
    :height="size"
    :width="size"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      v-if="name === 'arrow-left'"
      d="M19 12H5m6 6-6-6 6-6"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.8"
    />
    <path
      v-else-if="name === 'arrow-right'"
      d="M5 12h14m-6-6 6 6-6 6"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.8"
    />
    <path
      v-else-if="name === 'check'"
      d="m5 12 4.5 4.5L19 7"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    />
    <path
      v-else-if="name === 'close'"
      d="m6 6 12 12M18 6 6 18"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="1.8"
    />
    <path
      v-else-if="name === 'edit'"
      d="m14.5 6.5 3 3M4 20l4.25-.9L19 8.35a2.12 2.12 0 0 0-3-3L5.25 16.1 4 20Z"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.7"
    />
    <path
      v-else-if="name === 'plus'"
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="1.8"
    />
    <path
      v-else-if="name === 'redo'"
      d="M15 7h5v5m0-5-6.2 6.2a5.7 5.7 0 0 1-8.05 0L5 7.45"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.7"
    />
    <path
      v-else-if="name === 'search'"
      d="m20 20-3.8-3.8m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="1.7"
    />
    <path
      v-else-if="name === 'spark'"
      d="m12 3 1.2 5.8L19 10l-5.8 1.2L12 17l-1.2-5.8L5 10l5.8-1.2L12 3Zm6.2 13.4.5 2.1 2.1.5-2.1.5-.5 2.1-.5-2.1-2.1-.5 2.1-.5.5-2.1Z"
      stroke="currentColor"
      stroke-linejoin="round"
      stroke-width="1.5"
    />
    <path
      v-else-if="name === 'trash'"
      d="M5 7h14m-9 4v5m4-5v5M9 7V5h6v2m-9 0 1 13h10l1-13"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.7"
    />
    <path
      v-else
      d="M9 7H4v5m0-5 6.2 6.2a5.7 5.7 0 0 0 8.05 0L19 7.45"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.7"
    />
  </svg>
</template>
