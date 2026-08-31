import { computed, reactive, ref } from 'vue'

import { applyHistoryOperation, EditorHistory, type HistoryOperation } from './editor-history'
import {
  cloneNote,
  createId,
  NOTE_TITLE_MAX_LENGTH,
  notesEqual,
  TODO_DESCRIPTION_MAX_LENGTH,
  TODO_TEXT_MAX_LENGTH,
  type Note,
  type TodoItem,
} from './note'

type TextField = { kind: 'title' } | { kind: 'todo'; todoId: string } | { kind: 'todo-description'; todoId: string }

interface PendingTextEdit {
  before: string
  timer: ReturnType<typeof setTimeout>
}

const INPUT_COMMIT_DELAY = 650

export const useNoteEditor = (initialNote: Note) => {
  const draft = ref(cloneNote(initialNote))
  const savedSnapshot = ref(cloneNote(initialNote))
  const history = reactive(new EditorHistory())
  const pendingTextEdits = new Map<string, PendingTextEdit>()

  const hasChanges = computed(() => !notesEqual(draft.value, savedSnapshot.value))

  const fieldKey = (field: TextField): string => {
    if (field.kind === 'title') {
      return 'title'
    }

    return `${field.kind === 'todo-description' ? 'todo-description' : 'todo'}:${field.todoId}`
  }

  const readTextField = (field: TextField): string | null => {
    if (field.kind === 'title') {
      return draft.value.title
    }

    const todo = draft.value.todos.find((item) => item.id === field.todoId)

    if (!todo) {
      return null
    }

    return field.kind === 'todo-description' ? todo.description : todo.text
  }

  const recordTextOperation = (field: TextField, before: string, after: string): void => {
    const operation: HistoryOperation =
      field.kind === 'title'
        ? { type: 'set-title', before, after }
        : field.kind === 'todo-description'
          ? { type: 'set-todo-description', todoId: field.todoId, before, after }
          : { type: 'set-todo-text', todoId: field.todoId, before, after }

    history.record(operation)
  }

  const commitTextEdit = (field: TextField): void => {
    const key = fieldKey(field)
    const pending = pendingTextEdits.get(key)

    if (!pending) {
      return
    }

    clearTimeout(pending.timer)
    pendingTextEdits.delete(key)

    const after = readTextField(field)

    if (after !== null) {
      recordTextOperation(field, pending.before, after)
    }
  }

  const setTextField = (field: TextField, value: string): void => {
    const currentValue = readTextField(field)

    if (currentValue === null) {
      return
    }

    const maxLength =
      field.kind === 'title'
        ? NOTE_TITLE_MAX_LENGTH
        : field.kind === 'todo-description'
          ? TODO_DESCRIPTION_MAX_LENGTH
          : TODO_TEXT_MAX_LENGTH
    const nextValue = value.slice(0, maxLength)
    const key = fieldKey(field)
    const pending = pendingTextEdits.get(key)

    if (!pending) {
      pendingTextEdits.set(key, {
        before: currentValue,
        timer: setTimeout(() => commitTextEdit(field), INPUT_COMMIT_DELAY),
      })
    } else {
      clearTimeout(pending.timer)
      pending.timer = setTimeout(() => commitTextEdit(field), INPUT_COMMIT_DELAY)
    }

    if (field.kind === 'title') {
      draft.value.title = nextValue
    } else {
      const todo = draft.value.todos.find((item) => item.id === field.todoId)

      if (todo) {
        if (field.kind === 'todo-description') {
          todo.description = nextValue
        } else {
          todo.text = nextValue
        }
      }
    }
  }

  const flushPendingTextEdits = (): void => {
    for (const key of pendingTextEdits.keys()) {
      const field: TextField =
        key === 'title'
          ? { kind: 'title' }
          : key.startsWith('todo-description:')
            ? { kind: 'todo-description', todoId: key.slice('todo-description:'.length) }
            : { kind: 'todo', todoId: key.slice('todo:'.length) }
      commitTextEdit(field)
    }
  }

  const addTodo = (): TodoItem => {
    flushPendingTextEdits()

    const todo: TodoItem = {
      id: createId('todo'),
      text: '',
      description: '',
      completed: false,
    }
    const index = draft.value.todos.length

    draft.value.todos.push(todo)
    history.record({ type: 'add-todo', todo: { ...todo }, index })

    return todo
  }

  const removeTodo = (todoId: string): void => {
    flushPendingTextEdits()

    const index = draft.value.todos.findIndex((todo) => todo.id === todoId)

    if (index < 0) {
      return
    }

    const [todo] = draft.value.todos.splice(index, 1)

    if (todo) {
      history.record({ type: 'remove-todo', todo: { ...todo }, index })
    }
  }

  const toggleTodo = (todoId: string): void => {
    flushPendingTextEdits()

    const todo = draft.value.todos.find((item) => item.id === todoId)

    if (!todo) {
      return
    }

    const before = todo.completed
    todo.completed = !todo.completed
    history.record({ type: 'toggle-todo', todoId, before, after: todo.completed })
  }

  const undo = (): void => {
    flushPendingTextEdits()
    const operation = history.undo()

    if (operation) {
      applyHistoryOperation(draft.value, operation, 'undo')
    }
  }

  const redo = (): void => {
    flushPendingTextEdits()
    const operation = history.redo()

    if (operation) {
      applyHistoryOperation(draft.value, operation, 'redo')
    }
  }

  const replace = (note: Note): void => {
    flushPendingTextEdits()
    draft.value = cloneNote(note)
    savedSnapshot.value = cloneNote(note)
    history.clear()
  }

  const restoreDraft = (note: Note): void => {
    flushPendingTextEdits()
    draft.value = cloneNote(note)
    history.clear()
  }

  const markSaved = (note: Note): void => {
    replace(note)
  }

  const resetToSaved = (): void => {
    replace(savedSnapshot.value)
  }

  const dispose = (): void => {
    for (const pending of pendingTextEdits.values()) {
      clearTimeout(pending.timer)
    }

    pendingTextEdits.clear()
  }

  return {
    addTodo,
    canRedo: computed(() => history.canRedo),
    canUndo: computed(() => history.canUndo),
    commitTextEdit,
    dispose,
    draft,
    flushPendingTextEdits,
    hasChanges,
    history,
    markSaved,
    removeTodo,
    redo,
    replace,
    restoreDraft,
    resetToSaved,
    setTextField,
    toggleTodo,
    undo,
  }
}
