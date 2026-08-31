export const NOTES_SCHEMA_VERSION = 1
export const DRAFT_SCHEMA_VERSION = 1
export const HISTORY_LIMIT = 50
export const NOTE_TITLE_MAX_LENGTH = 80
export const TODO_TEXT_MAX_LENGTH = 120
export const TODO_DESCRIPTION_MAX_LENGTH = 500

export interface TodoItem {
  id: string
  text: string
  description: string
  completed: boolean
}

export interface Note {
  id: string
  title: string
  todos: TodoItem[]
  updatedAt: number
}

export interface PersistedNotes {
  version: typeof NOTES_SCHEMA_VERSION
  notes: Note[]
}

export interface PersistedDraft {
  version: typeof DRAFT_SCHEMA_VERSION
  note: Note
  savedAt: number
}

export const createEmptyNote = (id = 'new'): Note => ({
  id,
  title: '',
  todos: [],
  updatedAt: Date.now(),
})

export const createId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const cloneTodo = (todo: TodoItem): TodoItem => ({
  ...todo,
  text: todo.text.slice(0, TODO_TEXT_MAX_LENGTH),
  description: (todo.description ?? '').slice(0, TODO_DESCRIPTION_MAX_LENGTH),
})

export const cloneNote = (note: Note): Note => ({
  ...note,
  title: note.title.slice(0, NOTE_TITLE_MAX_LENGTH),
  todos: note.todos.map(cloneTodo),
})

export const notesEqual = (left: Note, right: Note): boolean =>
  left.title === right.title &&
  left.todos.length === right.todos.length &&
  left.todos.every(
    (todo, index) =>
      todo.id === right.todos[index]?.id &&
      todo.text === right.todos[index]?.text &&
      todo.description === right.todos[index]?.description &&
      todo.completed === right.todos[index]?.completed,
  )

export type NoteSortOrder = 'updated-desc' | 'updated-asc'

export const sortNotesByUpdatedAt = (notes: Note[], order: NoteSortOrder): Note[] =>
  [...notes].sort((left, right) =>
    order === 'updated-desc' ? right.updatedAt - left.updatedAt : left.updatedAt - right.updatedAt,
  )
