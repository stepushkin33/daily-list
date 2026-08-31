import {
  DRAFT_SCHEMA_VERSION,
  NOTES_SCHEMA_VERSION,
  type Note,
  type PersistedDraft,
  type PersistedNotes,
} from '../../entities/note/model/note'

export const NOTES_STORAGE_KEY = 'note-space:notes'
export const DRAFT_STORAGE_PREFIX = 'note-space:draft:'

export const isNote = (value: unknown): value is Note => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const note = value as Partial<Note>

  return (
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.updatedAt === 'number' &&
    Array.isArray(note.todos) &&
    note.todos.every(isTodo)
  )
}

const isTodo = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const todo = value as Partial<Note['todos'][number]>

  return (
    typeof todo.id === 'string' &&
    typeof todo.text === 'string' &&
    (typeof todo.description === 'undefined' || typeof todo.description === 'string') &&
    typeof todo.completed === 'boolean'
  )
}

const normalizeNote = (note: Note): Note => ({
  ...note,
  todos: note.todos.map((todo) => ({ ...todo, description: todo.description ?? '' })),
})

export const parsePersistedNotes = (raw: string | null): Note[] | null => {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedNotes>

    if (parsed.version !== NOTES_SCHEMA_VERSION || !Array.isArray(parsed.notes) || !parsed.notes.every(isNote)) {
      return null
    }

    return parsed.notes.map(normalizeNote)
  } catch {
    return null
  }
}

export const serializeNotes = (notes: Note[]): string =>
  JSON.stringify({ version: NOTES_SCHEMA_VERSION, notes } satisfies PersistedNotes)

export const parsePersistedDraft = (raw: string | null): Note | null => {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedDraft>

    if (parsed.version !== DRAFT_SCHEMA_VERSION || !parsed.note || !isNote(parsed.note)) {
      return null
    }

    return normalizeNote(parsed.note)
  } catch {
    return null
  }
}

export const serializeDraft = (note: Note): string =>
  JSON.stringify({ version: DRAFT_SCHEMA_VERSION, note, savedAt: Date.now() } satisfies PersistedDraft)

export const draftStorageKey = (noteId: string): string => `${DRAFT_STORAGE_PREFIX}${noteId}`
