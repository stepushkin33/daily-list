import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { createEmptyNote } from '../entities/note/model/note'
import { NOTES_STORAGE_KEY, serializeNotes } from '../shared/lib/notes-storage'
import { useNotesStore } from '../stores/notes'

describe('notes store persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('hydrates versioned notes and stores explicit saves', () => {
    const note = { ...createEmptyNote('note-persisted'), title: 'Из хранилища' }
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify({ version: 1, notes: [note] }))

    const store = useNotesStore()
    store.initStorage()

    expect(store.notes).toHaveLength(1)
    expect(store.findNote(note.id)?.title).toBe('Из хранилища')

    store.saveNote({ ...note, title: 'Сохранено' })
    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)!).notes[0].title).toBe('Сохранено')

    store.disposeStorage()
  })

  it('falls back to seed notes when the schema is missing or invalid', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify({ version: 99, notes: [] }))

    const store = useNotesStore()
    store.initStorage()

    expect(store.notes.length).toBeGreaterThan(0)
    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)!).version).toBe(1)

    store.disposeStorage()
  })

  it('adds empty descriptions when hydrating legacy todos', () => {
    localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        notes: [
          {
            id: 'legacy',
            title: 'Старая заметка',
            todos: [{ id: 'todo', text: 'Задача', completed: false }],
            updatedAt: 1,
          },
        ],
      }),
    )

    const store = useNotesStore()
    store.initStorage()

    expect(store.notes[0]?.todos[0]?.description).toBe('')
    store.disposeStorage()
  })

  it('round-trips an unsaved draft through its versioned storage key', () => {
    const store = useNotesStore()
    store.initStorage()
    const draft = { ...createEmptyNote('note-draft'), title: 'Черновик' }

    store.saveDraft(draft)

    expect(store.loadDraft(draft.id)?.title).toBe('Черновик')

    store.clearDraft(draft.id)
    expect(store.loadDraft(draft.id)).toBeNull()
    store.disposeStorage()
  })

  it('removes a note and its draft together', () => {
    const store = useNotesStore()
    store.initStorage()
    const note = store.saveNote({ ...createEmptyNote('note-remove'), title: 'Удалить' })
    store.saveDraft({ ...note, title: 'Несохранённая версия' })

    expect(store.deleteNote(note.id)).toBe(true)
    expect(store.findNote(note.id)).toBeUndefined()
    expect(store.loadDraft(note.id)).toBeNull()
    store.disposeStorage()
  })

  it('syncs notes changed in another browser tab', () => {
    const store = useNotesStore()
    store.initStorage()
    const externalNote = { ...createEmptyNote('external'), title: 'Из другой вкладки' }

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: NOTES_STORAGE_KEY,
        newValue: serializeNotes([externalNote]),
      }),
    )

    expect(store.findNote(externalNote.id)?.title).toBe('Из другой вкладки')
    store.disposeStorage()
  })
})
