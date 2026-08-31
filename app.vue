<script setup lang="ts">
import { onMounted } from 'vue'

import AppHeader from './components/AppHeader.vue'
import AppToast from './components/AppToast.vue'
import { useNotesStore } from './stores/notes'

const notesStore = useNotesStore()

onMounted(() => {
  notesStore.initStorage()
})
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <NuxtPage />
    </main>
    <AppToast />
  </div>
</template>
