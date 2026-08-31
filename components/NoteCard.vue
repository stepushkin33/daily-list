<script setup lang="ts">
import { computed } from 'vue'

import type { Note } from '../entities/note/model/note'

import AppIcon from './AppIcon.vue'
import TodoPreview from './TodoPreview.vue'

const props = defineProps<{
  note: Note
}>()

const completedCount = computed(() => props.note.todos.filter((todo) => todo.completed).length)

const updatedLabel = computed(() =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(props.note.updatedAt),
)

const emit = defineEmits<{
  delete: []
}>()
</script>

<template>
  <article class="note-card">
    <NuxtLink
      class="note-card-link"
      :to="`/notes/${note.id}`"
      :aria-label="`Открыть заметку ${note.title || 'Без названия'}`"
    >
      <div class="note-card-meta">
        <span class="note-card-label">заметка</span>
        <time class="note-card-date" :datetime="new Date(note.updatedAt).toISOString()">{{ updatedLabel }}</time>
      </div>
      <span class="note-card-title">{{ note.title || 'Без названия' }}</span>
      <TodoPreview :items="note.todos" />
      <div class="note-card-footer">
        <span class="note-card-progress"
          >выполнено <strong>{{ completedCount }}/{{ note.todos.length }}</strong></span
        >
        <span class="card-action card-action-primary">
          <span>Открыть</span>
          <AppIcon name="arrow-right" :size="16" />
        </span>
      </div>
    </NuxtLink>
    <button class="icon-button card-delete" type="button" aria-label="Удалить заметку" @click="emit('delete')">
      <AppIcon name="trash" :size="15" />
    </button>
  </article>
</template>
