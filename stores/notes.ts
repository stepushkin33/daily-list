import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { cloneNote, type Note } from '../entities/note/model/note'
import { createSeedNotes } from '../entities/note/model/seed-notes'
import {
  draftStorageKey,
  NOTES_STORAGE_KEY,
  parsePersistedDraft,
  parsePersistedNotes,
  serializeDraft,
  serializeNotes,
} from '../shared/lib/notes-storage'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const isReady = ref(false)
  let storageListener: ((event: StorageEvent) => void) | null = null

  const noteCount = computed(() => notes.value.length)

  const persistNotes = (): void => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(NOTES_STORAGE_KEY, serializeNotes(notes.value))
    } catch {
      // Storage can be unavailable in private browsing; the in-memory state remains usable.
    }
  }

  const syncFromStorage = (raw: string | null): void => {
    const persistedNotes = parsePersistedNotes(raw)

    if (persistedNotes) {
      notes.value = persistedNotes.map(cloneNote)
    } else if (raw === null) {
      notes.value = []
    }
  }

  const initStorage = (): void => {
    if (isReady.value || typeof window === 'undefined') {
      return
    }

    let persistedNotes: Note[] | null = null

    try {
      persistedNotes = parsePersistedNotes(window.localStorage.getItem(NOTES_STORAGE_KEY))
    } catch {
      persistedNotes = null
    }

    notes.value = (persistedNotes ?? createSeedNotes()).map(cloneNote)

    if (!persistedNotes) {
      persistNotes()
    }

    storageListener = (event: StorageEvent): void => {
      if (event.key === NOTES_STORAGE_KEY) {
        syncFromStorage(event.newValue)
      }
    }
    window.addEventListener('storage', storageListener)
    isReady.value = true
  }

  const disposeStorage = (): void => {
    if (typeof window !== 'undefined' && storageListener) {
      window.removeEventListener('storage', storageListener)
    }

    storageListener = null
    isReady.value = false
  }

  const findNote = (noteId: string): Note | undefined => notes.value.find((note) => note.id === noteId)

  const saveNote = (note: Note): Note => {
    const savedNote: Note = {
      ...cloneNote(note),
      updatedAt: Date.now(),
    }
    const noteIndex = notes.value.findIndex((item) => item.id === note.id)

    if (noteIndex >= 0) {
      notes.value.splice(noteIndex, 1, savedNote)
    } else {
      notes.value.unshift(savedNote)
    }

    persistNotes()
    clearDraft(note.id)

    return cloneNote(savedNote)
  }

  const deleteNote = (noteId: string): boolean => {
    const noteIndex = notes.value.findIndex((note) => note.id === noteId)

    if (noteIndex < 0) {
      return false
    }

    notes.value.splice(noteIndex, 1)
    persistNotes()
    clearDraft(noteId)

    return true
  }

  const loadDraft = (noteId: string): Note | null => {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      return parsePersistedDraft(window.localStorage.getItem(draftStorageKey(noteId)))
    } catch {
      return null
    }
  }

  const saveDraft = (note: Note): void => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(draftStorageKey(note.id), serializeDraft(note))
    } catch {
      // A draft is a convenience; editing can continue when storage is unavailable.
    }
  }

  const clearDraft = (noteId: string): void => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.removeItem(draftStorageKey(noteId))
    } catch {
      // Ignore storage errors so save/delete actions are never blocked.
    }
  }

  return {
    clearDraft,
    deleteNote,
    disposeStorage,
    findNote,
    initStorage,
    isReady,
    loadDraft,
    noteCount,
    notes,
    saveDraft,
    saveNote,
  }
})
