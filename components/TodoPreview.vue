<script setup lang="ts">
import { computed } from 'vue'

import type { TodoItem } from '../entities/note/model/note'

const props = withDefaults(
  defineProps<{
    items: TodoItem[]
    limit?: number
  }>(),
  { limit: 3 },
)

const visibleItems = computed(() => props.items.slice(0, props.limit))
const hiddenCount = computed(() => Math.max(0, props.items.length - props.limit))
</script>

<template>
  <div class="todo-preview">
    <template v-if="visibleItems.length">
      <div v-for="todo in visibleItems" :key="todo.id" class="preview-row">
        <span class="preview-marker" :class="{ 'preview-marker-done': todo.completed }" aria-hidden="true">
          <AppIcon v-if="todo.completed" name="check" :size="12" />
        </span>
        <span class="preview-text" :class="{ 'preview-text-done': todo.completed }">{{
          todo.text || 'Без текста'
        }}</span>
      </div>
    </template>
    <span v-else class="todo-empty">Пока нет задач</span>
    <span v-if="hiddenCount" class="preview-more">+{{ hiddenCount }} ещё</span>
  </div>
</template>
