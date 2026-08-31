import { HISTORY_LIMIT, type Note, type TodoItem } from './note'

export type HistoryOperation =
  | { type: 'set-title'; before: string; after: string }
  | { type: 'set-todo-text'; todoId: string; before: string; after: string }
  | { type: 'set-todo-description'; todoId: string; before: string; after: string }
  | { type: 'toggle-todo'; todoId: string; before: boolean; after: boolean }
  | { type: 'add-todo'; todo: TodoItem; index: number }
  | { type: 'remove-todo'; todo: TodoItem; index: number }

export type HistoryDirection = 'undo' | 'redo'

export class EditorHistory {
  private readonly limit: number

  private past: HistoryOperation[] = []

  private future: HistoryOperation[] = []

  public constructor(limit = HISTORY_LIMIT) {
    this.limit = Math.max(1, limit)
  }

  public get canUndo(): boolean {
    return this.past.length > 0
  }

  public get canRedo(): boolean {
    return this.future.length > 0
  }

  public get undoCount(): number {
    return this.past.length
  }

  public get redoCount(): number {
    return this.future.length
  }

  public record(operation: HistoryOperation): void {
    if (isNoop(operation)) {
      return
    }

    this.past.push(operation)
    this.future = []

    if (this.past.length > this.limit) {
      this.past.shift()
    }
  }

  public undo(): HistoryOperation | null {
    const operation = this.past.pop()

    if (!operation) {
      return null
    }

    this.future.push(operation)
    return operation
  }

  public redo(): HistoryOperation | null {
    const operation = this.future.pop()

    if (!operation) {
      return null
    }

    this.past.push(operation)
    return operation
  }

  public clear(): void {
    this.past = []
    this.future = []
  }
}

const isNoop = (operation: HistoryOperation): boolean => {
  if (
    operation.type === 'set-title' ||
    operation.type === 'set-todo-text' ||
    operation.type === 'set-todo-description'
  ) {
    return operation.before === operation.after
  }

  if (operation.type === 'toggle-todo') {
    return operation.before === operation.after
  }

  return false
}

export const applyHistoryOperation = (note: Note, operation: HistoryOperation, direction: HistoryDirection): void => {
  const isUndo = direction === 'undo'

  if (operation.type === 'set-title') {
    note.title = isUndo ? operation.before : operation.after
    return
  }

  if (operation.type === 'set-todo-text' || operation.type === 'set-todo-description') {
    const todo = note.todos.find((item) => item.id === operation.todoId)

    if (todo) {
      if (operation.type === 'set-todo-text') {
        todo.text = isUndo ? operation.before : operation.after
      } else {
        todo.description = isUndo ? operation.before : operation.after
      }
    }

    return
  }

  if (operation.type === 'toggle-todo') {
    const todo = note.todos.find((item) => item.id === operation.todoId)

    if (todo) {
      todo.completed = isUndo ? operation.before : operation.after
    }

    return
  }

  if (operation.type === 'add-todo') {
    if (isUndo) {
      removeTodoById(note, operation.todo.id)
    } else {
      note.todos.splice(operation.index, 0, { ...operation.todo })
    }

    return
  }

  if (isUndo) {
    note.todos.splice(operation.index, 0, { ...operation.todo })
  } else {
    removeTodoById(note, operation.todo.id)
  }
}

const removeTodoById = (note: Note, todoId: string): void => {
  const index = note.todos.findIndex((todo) => todo.id === todoId)

  if (index >= 0) {
    note.todos.splice(index, 1)
  }
}
