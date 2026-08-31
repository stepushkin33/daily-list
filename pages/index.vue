<script setup lang="ts">
import { computed, ref } from 'vue'

import NoteCard from '../components/NoteCard.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { sortNotesByUpdatedAt, type Note, type NoteSortOrder } from '../entities/note/model/note'
import { useNotesStore } from '../stores/notes'
import { useUiStore } from '../stores/ui'

const notesStore = useNotesStore()
const uiStore = useUiStore()
notesStore.initStorage()

const searchQuery = ref('')
const sortOrder = ref<NoteSortOrder>('updated-desc')
const noteToDelete = ref<Note | null>(null)
const showDeleteModal = ref(false)

const filteredNotes = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase()

  const matchingNotes = query
    ? notesStore.notes.filter((note) => {
        const searchableText = [note.title, ...note.todos.map((todo) => todo.text)].join(' ').toLocaleLowerCase()

        return searchableText.includes(query)
      })
    : notesStore.notes

  return sortNotesByUpdatedAt(matchingNotes, sortOrder.value)
})

const askToDelete = (note: Note): void => {
  noteToDelete.value = note
  showDeleteModal.value = true
}

const closeDeleteModal = (): void => {
  showDeleteModal.value = false
  noteToDelete.value = null
}

const deleteNote = (): void => {
  if (noteToDelete.value) {
    notesStore.deleteNote(noteToDelete.value.id)
    uiStore.showToast('Заметка удалена')
  }

  closeDeleteModal()
}
</script>

<template>
  <div class="page-container page-content">
    <section class="hero-section">
      <div class="hero-copy">
        <h1>Списки,<br /><span>которые работают.</span></h1>
        <p class="hero-description">Соберите задачи в понятные списки, держите фокус и быстро отмечайте сделанное.</p>
      </div>
      <div class="hero-summary">
        <span class="hero-summary-label">Коллекция</span>
        <strong>{{ notesStore.noteCount }}</strong>
        <span class="hero-summary-copy">заметок сохранено локально</span>
        <NuxtLink class="button button-primary" to="/notes/new">
          <AppIcon name="plus" :size="16" />
          Новая заметка
        </NuxtLink>
      </div>
    </section>

    <section class="notes-section" aria-labelledby="notes-heading">
      <div class="section-heading">
        <div>
          <h2 id="notes-heading">Все заметки</h2>
        </div>
        <div class="section-tools">
          <div class="search-field">
            <AppIcon name="search" :size="17" />
            <input v-model="searchQuery" type="search" placeholder="Поиск по заметкам" aria-label="Поиск по заметкам" />
          </div>
          <label class="sort-control">
            <span>Сортировка</span>
            <select v-model="sortOrder" aria-label="Сортировка заметок">
              <option value="updated-desc">Сначала новые</option>
              <option value="updated-asc">Сначала старые</option>
            </select>
          </label>
        </div>
      </div>

      <div v-if="filteredNotes.length" class="notes-grid">
        <NoteCard v-for="note in filteredNotes" :key="note.id" :note="note" @delete="askToDelete(note)" />
        <NuxtLink class="new-note-card" to="/notes/new">
          <span class="new-note-icon"><AppIcon name="plus" :size="22" /></span>
          <span class="new-note-title">Добавить заметку</span>
          <span class="new-note-caption">Новая страница для новой мысли</span>
        </NuxtLink>
      </div>

      <div v-else class="empty-state">
        <span class="empty-state-icon"><AppIcon name="search" :size="22" /></span>
        <h3>Ничего не нашлось</h3>
        <p>Попробуйте изменить запрос или начните с новой заметки.</p>
        <NuxtLink class="button button-dark" to="/notes/new"
          >Создать заметку <AppIcon name="arrow-right" :size="16"
        /></NuxtLink>
      </div>
    </section>
  </div>

  <ConfirmModal
    :open="showDeleteModal"
    title="Удалить заметку?"
    message="Заметка и все задачи внутри будут удалены без возможности восстановления."
    confirm-text="Удалить заметку"
    tone="danger"
    @close="closeDeleteModal"
    @confirm="deleteNote"
  />
</template>
