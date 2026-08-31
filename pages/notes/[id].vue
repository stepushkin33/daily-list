<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { navigateTo, useRoute, useRouter } from '#app'

import AppIcon from '../../components/AppIcon.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import {
  cloneNote,
  createEmptyNote,
  createId,
  NOTE_TITLE_MAX_LENGTH,
  notesEqual,
  TODO_DESCRIPTION_MAX_LENGTH,
  TODO_TEXT_MAX_LENGTH,
  type Note,
} from '../../entities/note/model/note'
import { useNoteEditor } from '../../entities/note/model/use-note-editor'
import { useNotesStore } from '../../stores/notes'
import { useUiStore } from '../../stores/ui'

definePageMeta({ key: (route) => route.fullPath })

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()
const uiStore = useUiStore()
notesStore.initStorage()

const noteId = computed(() => {
  const routeId = route.params.id

  return Array.isArray(routeId) ? (routeId[0] ?? '') : routeId
})
const isNewNote = computed(() => noteId.value === 'new')
const sourceNote = computed(() => (isNewNote.value ? createEmptyNote('new') : notesStore.findNote(noteId.value)))
const isUnavailable = computed(() => !isNewNote.value && !sourceNote.value)
const initialNote = sourceNote.value ? cloneNote(sourceNote.value) : createEmptyNote(noteId.value)
const editor = useNoteEditor(initialNote)
const { canRedo, canUndo, draft, hasChanges } = editor

const showCancelModal = ref(false)
const showDeleteModal = ref(false)
const showRestoreModal = ref(false)
const draftToRestore = ref<Note | null>(null)
const titleError = ref('')
const todoErrors = reactive<Record<string, string>>({})
const expandedDescriptions = reactive<Record<string, boolean>>({})
const expandableDescriptions = reactive<Record<string, boolean>>({})
let draftSaveTimer: ReturnType<typeof setTimeout> | null = null

const completedTodos = computed(() => draft.value.todos.filter((todo) => todo.completed).length)
const lastChangedLabel = computed(() => {
  if (isNewNote.value) {
    return 'новая заметка'
  }

  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(draft.value.updatedAt)
})

const scheduleDraftSave = (): void => {
  if (draftSaveTimer) {
    clearTimeout(draftSaveTimer)
  }

  draftSaveTimer = setTimeout(() => {
    draftSaveTimer = null

    if (hasChanges.value && !isUnavailable.value) {
      notesStore.saveDraft(draft.value)
    }
  }, 700)
}

const flushDraftSave = (): void => {
  if (draftSaveTimer) {
    clearTimeout(draftSaveTimer)
    draftSaveTimer = null
  }

  editor.flushPendingTextEdits()

  if (hasChanges.value && !isUnavailable.value) {
    notesStore.saveDraft(draft.value)
  }
}

watch(draft, scheduleDraftSave, { deep: true })

const clearErrors = (todoId?: string): void => {
  if (todoId) {
    delete todoErrors[todoId]
  } else {
    titleError.value = ''
  }
}

const validate = (): boolean => {
  titleError.value = ''
  Object.keys(todoErrors).forEach((todoId) => delete todoErrors[todoId])
  let isValid = true

  if (!draft.value.title.trim()) {
    titleError.value = 'Добавьте название заметки'
    isValid = false
  }

  draft.value.todos.forEach((todo) => {
    if (!todo.text.trim()) {
      todoErrors[todo.id] = 'Напишите текст задачи или удалите её'
      isValid = false
    }
  })

  return isValid
}

const save = async (): Promise<void> => {
  editor.flushPendingTextEdits()

  if (isUnavailable.value || !validate()) {
    return
  }

  const noteToSave: Note = {
    ...cloneNote(draft.value),
    id: isNewNote.value ? createId('note') : draft.value.id,
  }
  const savedNote = notesStore.saveNote(noteToSave)
  editor.markSaved(savedNote)
  if (isNewNote.value) {
    notesStore.clearDraft('new')
  }

  uiStore.showToast(isNewNote.value ? 'Заметка создана' : 'Изменения сохранены')
  await router.push('/')
}

const requestCancel = (): void => {
  if (hasChanges.value) {
    showCancelModal.value = true
  } else {
    void navigateTo('/')
  }
}

const cancelEditing = async (): Promise<void> => {
  notesStore.clearDraft(noteId.value)
  editor.resetToSaved()
  showCancelModal.value = false
  await router.push('/')
}

const requestDelete = (): void => {
  showDeleteModal.value = true
}

const deleteNote = async (): Promise<void> => {
  const deleted = notesStore.deleteNote(noteId.value)

  showDeleteModal.value = false

  if (deleted) {
    uiStore.showToast('Заметка удалена')
  }

  await router.push('/')
}

const refreshDescriptionOverflow = (todoId?: string): void => {
  const todoIds = todoId ? [todoId] : draft.value.todos.map((todo) => todo.id)

  todoIds.forEach((id) => {
    const textarea = document.querySelector<HTMLTextAreaElement>(`[data-todo-description="${id}"]`)

    if (!textarea) {
      return
    }

    if (expandedDescriptions[id]) {
      expandableDescriptions[id] = true
      return
    }

    expandableDescriptions[id] = textarea.scrollHeight > textarea.clientHeight + 1
  })
}

const toggleDescription = async (todoId: string): Promise<void> => {
  expandedDescriptions[todoId] = !expandedDescriptions[todoId]
  await nextTick()
  refreshDescriptionOverflow(todoId)
}

const updateTitle = (event: Event): void => {
  const input = event.target as HTMLInputElement
  editor.setTextField({ kind: 'title' }, input.value)
  clearErrors()
}

const updateTodoText = (todoId: string, event: Event): void => {
  const input = event.target as HTMLInputElement
  editor.setTextField({ kind: 'todo', todoId }, input.value)
  clearErrors(todoId)
}

const updateTodoDescription = (todoId: string, event: Event): void => {
  const textarea = event.target as HTMLTextAreaElement
  editor.setTextField({ kind: 'todo-description', todoId }, textarea.value)
  void nextTick(() => refreshDescriptionOverflow(todoId))
}

const removeTodo = (todoId: string): void => {
  editor.removeTodo(todoId)
  delete todoErrors[todoId]
  delete expandedDescriptions[todoId]
  delete expandableDescriptions[todoId]
}

const addTodo = (): void => {
  const todo = editor.addTodo()

  nextTick(() => {
    document.querySelector<HTMLInputElement>(`[data-todo-input="${todo.id}"]`)?.focus()
  })
}

const restoreDraft = (): void => {
  if (draftToRestore.value) {
    editor.restoreDraft(draftToRestore.value)
    uiStore.showToast('Черновик восстановлен')
    void nextTick(() => refreshDescriptionOverflow())
  }

  showRestoreModal.value = false
  draftToRestore.value = null
}

const discardDraft = (): void => {
  notesStore.clearDraft(noteId.value)
  showRestoreModal.value = false
  draftToRestore.value = null
}

const isTextEditingTarget = (target: EventTarget | null): boolean => {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

const handleGlobalUndo = (event: KeyboardEvent): void => {
  if (
    !(event.ctrlKey || event.metaKey) ||
    event.key.toLowerCase() !== 'z' ||
    isTextEditingTarget(event.target) ||
    document.querySelector('[role="dialog"]')
  ) {
    return
  }

  event.preventDefault()

  if (event.shiftKey) {
    editor.redo()
  } else {
    editor.undo()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalUndo)
  window.addEventListener('beforeunload', flushDraftSave)
  void nextTick(() => refreshDescriptionOverflow())

  if (!isUnavailable.value) {
    const savedDraft = notesStore.loadDraft(noteId.value)

    const shouldOfferRestore = savedDraft && !notesEqual(savedDraft, initialNote)

    if (shouldOfferRestore) {
      draftToRestore.value = savedDraft
      showRestoreModal.value = true
    }
  }
})

onBeforeUnmount(() => {
  flushDraftSave()
  editor.dispose()
  window.removeEventListener('keydown', handleGlobalUndo)
  window.removeEventListener('beforeunload', flushDraftSave)
})
</script>

<template>
  <div class="page-container page-content editor-page">
    <div v-if="isUnavailable" class="unavailable-state">
      <span class="empty-state-icon"><AppIcon name="close" :size="22" /></span>
      <h1>Эта страница<br /><em>уже закрыта.</em></h1>
      <p>Возможно, заметку удалили в другой вкладке. Обновите список, чтобы продолжить работу.</p>
      <NuxtLink class="button button-dark" to="/"
        >Вернуться к заметкам <AppIcon name="arrow-right" :size="16"
      /></NuxtLink>
    </div>

    <template v-else>
      <div class="editor-topbar">
        <button class="back-button" type="button" @click="requestCancel">
          <AppIcon name="arrow-left" :size="17" />
          <span>Назад к заметкам</span>
        </button>
        <div class="editor-topbar-meta">
          <span class="editor-updated">{{ lastChangedLabel }}</span>
        </div>
      </div>

      <section class="editor-heading">
        <div>
          <h1>{{ isNewNote ? 'Новая заметка.' : 'Продолжим?' }}</h1>
        </div>
        <div class="history-controls" aria-label="История изменений">
          <button
            class="history-button"
            type="button"
            :disabled="!canUndo"
            aria-label="Отменить изменение"
            title="Отменить (Ctrl+Z)"
            @click="editor.undo"
          >
            <AppIcon name="undo" :size="17" />
          </button>
          <button
            class="history-button"
            type="button"
            :disabled="!canRedo"
            aria-label="Повторить изменение"
            title="Повторить (Shift+Ctrl+Z)"
            @click="editor.redo"
          >
            <AppIcon name="redo" :size="17" />
          </button>
        </div>
      </section>

      <section class="editor-layout" aria-label="Редактор заметки">
        <div class="editor-main-card">
          <label class="field-label" for="note-title">Название заметки</label>
          <input
            id="note-title"
            class="title-input"
            :class="{ 'input-error': titleError }"
            :maxlength="NOTE_TITLE_MAX_LENGTH"
            :value="draft.title"
            type="text"
            placeholder="Например, планы на выходные"
            @input="updateTitle"
            @blur="editor.commitTextEdit({ kind: 'title' })"
          />
          <span v-if="titleError" class="field-error">{{ titleError }}</span>

          <div class="todo-heading">
            <div>
              <span class="field-label">Список задач</span>
              <span class="todo-counter">выполнено {{ completedTodos }}/{{ draft.todos.length }}</span>
            </div>
            <button class="text-button" type="button" @click="addTodo">
              <AppIcon name="plus" :size="16" />
              Добавить пункт
            </button>
          </div>

          <div v-if="draft.todos.length" class="todo-editor-list">
            <div
              v-for="(todo, index) in draft.todos"
              :key="todo.id"
              class="todo-editor-row"
              :class="{ 'todo-row-error': todoErrors[todo.id] }"
            >
              <button
                class="todo-checkbox"
                :class="{ 'todo-checkbox-checked': todo.completed }"
                type="button"
                :aria-label="todo.completed ? 'Отметить как невыполненное' : 'Отметить как выполненное'"
                :aria-pressed="todo.completed"
                @click="editor.toggleTodo(todo.id)"
              >
                <AppIcon v-if="todo.completed" name="check" :size="14" />
              </button>
              <div class="todo-input-wrap">
                <span class="todo-index">{{ String(index + 1).padStart(2, '0') }}</span>
                <div class="todo-fields">
                  <div class="todo-main-field">
                    <input
                      class="todo-input"
                      :class="{ 'todo-input-completed': todo.completed }"
                      :data-todo-input="todo.id"
                      :maxlength="TODO_TEXT_MAX_LENGTH"
                      :value="todo.text"
                      type="text"
                      :placeholder="`Задача ${index + 1}`"
                      @input="updateTodoText(todo.id, $event)"
                      @blur="editor.commitTextEdit({ kind: 'todo', todoId: todo.id })"
                    />
                  </div>
                  <div class="todo-description-wrap">
                    <textarea
                      class="todo-description-input"
                      :class="{
                        'todo-description-completed': todo.completed,
                        'todo-description-input-expanded': expandedDescriptions[todo.id],
                      }"
                      :data-todo-description="todo.id"
                      :maxlength="TODO_DESCRIPTION_MAX_LENGTH"
                      :value="todo.description"
                      rows="2"
                      placeholder="Описание пункта (необязательно)"
                      @input="updateTodoDescription(todo.id, $event)"
                      @blur="editor.commitTextEdit({ kind: 'todo-description', todoId: todo.id })"
                    />
                    <button
                      v-if="expandableDescriptions[todo.id]"
                      class="description-toggle"
                      type="button"
                      :aria-expanded="expandedDescriptions[todo.id]"
                      @click="toggleDescription(todo.id)"
                    >
                      {{ expandedDescriptions[todo.id] ? 'Свернуть' : 'Развернуть' }}
                    </button>
                  </div>
                </div>
              </div>
              <button
                class="icon-button row-delete"
                type="button"
                aria-label="Удалить пункт"
                @click="removeTodo(todo.id)"
              >
                <AppIcon name="trash" :size="17" />
              </button>
              <span v-if="todoErrors[todo.id]" class="field-error todo-error">{{ todoErrors[todo.id] }}</span>
            </div>
          </div>
          <div v-else class="todo-list-empty">
            <span class="todo-list-empty-icon"><AppIcon name="spark" :size="18" /></span>
            <span>Здесь появятся задачи, которые нужно держать в фокусе.</span>
          </div>
        </div>

        <aside class="editor-aside">
          <div class="aside-note">
            <p>Сначала фиксируйте задачу, затем добавляйте контекст. Всё сохраняется локально.</p>
            <span class="aside-note-tag">offline-first</span>
          </div>
          <div class="keyboard-hint">
            <span class="keyboard-key">⌘</span><span class="keyboard-key">Z</span>
            <span>отменить действие</span>
          </div>
          <div class="keyboard-hint">
            <span class="keyboard-key">⇧</span><span class="keyboard-key">⌘</span><span class="keyboard-key">Z</span>
            <span>повторить действие</span>
          </div>
        </aside>
      </section>

      <div class="editor-actions">
        <div class="editor-actions-secondary">
          <button v-if="!isNewNote" class="danger-link" type="button" @click="requestDelete">
            <AppIcon name="trash" :size="16" />
            Удалить заметку
          </button>
        </div>
        <div class="editor-actions-primary">
          <button class="button button-ghost" type="button" @click="requestCancel">Отменить</button>
          <button class="button button-dark" type="button" @click="save">
            Сохранить изменения
            <AppIcon name="arrow-right" :size="16" />
          </button>
        </div>
      </div>
    </template>
  </div>

  <ConfirmModal
    :open="showCancelModal"
    title="Отменить редактирование?"
    message="Все изменения в этой сессии будут удалены. Черновик тоже не сохранится."
    confirm-text="Отменить изменения"
    @close="showCancelModal = false"
    @confirm="cancelEditing"
  />
  <ConfirmModal
    :open="showDeleteModal"
    title="Удалить заметку?"
    message="Заметка и все задачи внутри будут удалены без возможности восстановления."
    confirm-text="Удалить заметку"
    tone="danger"
    @close="showDeleteModal = false"
    @confirm="deleteNote"
  />
  <ConfirmModal
    :open="showRestoreModal"
    title="Нашли черновик"
    message="Похоже, в прошлый раз редактирование завершилось не до конца. Восстановить последнюю версию?"
    confirm-text="Восстановить"
    @close="discardDraft"
    @confirm="restoreDraft"
  />
</template>
