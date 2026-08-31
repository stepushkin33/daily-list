import { describe, expect, it } from 'vitest'

import { applyHistoryOperation, EditorHistory } from '../entities/note/model/editor-history'
import { type Note } from '../entities/note/model/note'

const createNote = (): Note => ({
  id: 'note-1',
  title: 'Исходное название',
  todos: [{ id: 'todo-1', text: 'Первая задача', description: '', completed: false }],
  updatedAt: 1,
})

describe('EditorHistory', () => {
  it('undoes and redoes granular text changes without storing note snapshots', () => {
    const history = new EditorHistory()
    const note = createNote()
    const operation = { type: 'set-title' as const, before: 'Исходное название', after: 'Новое название' }

    note.title = operation.after
    history.record(operation)

    expect(history.undoCount).toBe(1)
    expect(history.redoCount).toBe(0)

    const undoOperation = history.undo()
    expect(undoOperation).toEqual(operation)
    applyHistoryOperation(note, undoOperation!, 'undo')
    expect(note.title).toBe('Исходное название')

    const redoOperation = history.redo()
    expect(redoOperation).toEqual(operation)
    applyHistoryOperation(note, redoOperation!, 'redo')
    expect(note.title).toBe('Новое название')
  })

  it('clears the redo branch after a new change', () => {
    const history = new EditorHistory()
    const first = { type: 'set-title' as const, before: '', after: 'A' }
    const second = { type: 'set-title' as const, before: 'A', after: 'B' }
    const branch = { type: 'set-title' as const, before: 'A', after: 'C' }

    history.record(first)
    history.record(second)
    history.undo()
    history.record(branch)

    expect(history.canRedo).toBe(false)
    expect(history.undoCount).toBe(2)
  })

  it('keeps the last 50 operations', () => {
    const history = new EditorHistory()

    for (let index = 0; index < 55; index += 1) {
      history.record({ type: 'set-title', before: String(index), after: String(index + 1) })
    }

    expect(history.undoCount).toBe(50)
    expect(history.redoCount).toBe(0)
  })

  it('applies add, remove and toggle operations atomically', () => {
    const history = new EditorHistory()
    const note = createNote()
    const todo = { id: 'todo-2', text: 'Вторая задача', description: '', completed: false }

    note.todos.push(todo)
    history.record({ type: 'add-todo', todo, index: 1 })
    applyHistoryOperation(note, history.undo()!, 'undo')
    expect(note.todos).toHaveLength(1)

    applyHistoryOperation(note, history.redo()!, 'redo')
    expect(note.todos).toHaveLength(2)

    history.record({ type: 'toggle-todo', todoId: 'todo-2', before: false, after: true })
    note.todos[1]!.completed = true
    applyHistoryOperation(note, history.undo()!, 'undo')
    expect(note.todos[1]!.completed).toBe(false)

    history.record({ type: 'remove-todo', todo: note.todos[1]!, index: 1 })
    note.todos.splice(1, 1)
    applyHistoryOperation(note, history.undo()!, 'undo')
    expect(note.todos[1]!.id).toBe('todo-2')
  })
})
