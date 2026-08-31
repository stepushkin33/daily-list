import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  NOTE_TITLE_MAX_LENGTH,
  TODO_DESCRIPTION_MAX_LENGTH,
  TODO_TEXT_MAX_LENGTH,
  type Note,
} from '../entities/note/model/note'
import { useNoteEditor } from '../entities/note/model/use-note-editor'

const note: Note = {
  id: 'note-1',
  title: 'До изменений',
  todos: [{ id: 'todo-1', text: 'Первая задача', description: '', completed: false }],
  updatedAt: 1,
}

describe('useNoteEditor', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('groups continuous title input into one history operation', () => {
    vi.useFakeTimers()
    const editor = useNoteEditor(note)

    editor.setTextField({ kind: 'title' }, 'Н')
    editor.setTextField({ kind: 'title' }, 'Новая')

    expect(editor.history.undoCount).toBe(0)

    vi.advanceTimersByTime(650)

    expect(editor.history.undoCount).toBe(1)
    editor.undo()
    expect(editor.draft.value.title).toBe('До изменений')
    editor.dispose()
  })

  it('flushes text edits before an atomic Todo operation', () => {
    vi.useFakeTimers()
    const editor = useNoteEditor(note)

    editor.setTextField({ kind: 'todo', todoId: 'todo-1' }, 'Обновлённая задача')
    editor.toggleTodo('todo-1')

    expect(editor.history.undoCount).toBe(2)
    editor.undo()
    expect(editor.draft.value.todos[0]?.completed).toBe(false)
    editor.undo()
    expect(editor.draft.value.todos[0]?.text).toBe('Первая задача')
    editor.dispose()
  })

  it('stores and undoes a Todo description edit', () => {
    vi.useFakeTimers()
    const editor = useNoteEditor(note)

    editor.setTextField({ kind: 'todo-description', todoId: 'todo-1' }, 'Контекст задачи')
    vi.advanceTimersByTime(650)

    expect(editor.draft.value.todos[0]?.description).toBe('Контекст задачи')
    editor.undo()
    expect(editor.draft.value.todos[0]?.description).toBe('')
    editor.dispose()
  })

  it('exposes only available undo and redo directions', () => {
    const editor = useNoteEditor(note)

    expect(editor.canUndo.value).toBe(false)
    expect(editor.canRedo.value).toBe(false)

    editor.toggleTodo('todo-1')
    expect(editor.canUndo.value).toBe(true)
    expect(editor.canRedo.value).toBe(false)

    editor.undo()
    expect(editor.canUndo.value).toBe(false)
    expect(editor.canRedo.value).toBe(true)

    editor.redo()
    expect(editor.canUndo.value).toBe(true)
    expect(editor.canRedo.value).toBe(false)
    editor.dispose()
  })

  it('limits note titles, todo text and descriptions', () => {
    const editor = useNoteEditor(note)

    editor.setTextField({ kind: 'title' }, 'a'.repeat(NOTE_TITLE_MAX_LENGTH + 20))
    editor.setTextField({ kind: 'todo', todoId: 'todo-1' }, 'b'.repeat(TODO_TEXT_MAX_LENGTH + 20))
    editor.setTextField({ kind: 'todo-description', todoId: 'todo-1' }, 'c'.repeat(TODO_DESCRIPTION_MAX_LENGTH + 20))

    expect(editor.draft.value.title).toHaveLength(NOTE_TITLE_MAX_LENGTH)
    expect(editor.draft.value.todos[0]?.text).toHaveLength(TODO_TEXT_MAX_LENGTH)
    expect(editor.draft.value.todos[0]?.description).toHaveLength(TODO_DESCRIPTION_MAX_LENGTH)
    editor.dispose()
  })
})
