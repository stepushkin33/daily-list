import { isValidDateInput, isValidTimeInput } from '@/shared/lib/date/date'
import { isTodoTextValid, normalizeTodoText, type Todo, TODOS_STORAGE_KEY } from './todo'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface PersistedTodos {
  version: 1
  todos: Todo[]
}

type PersistedTodo = Omit<Todo, 'dueDate' | 'dueTime'> & {
  dueDate?: string | null
  dueTime?: string | null
}

const isValidOptionalDate = (value: unknown): value is string | null | undefined =>
  value === null || typeof value === 'undefined' || (typeof value === 'string' && (!value || isValidDateInput(value)))

const isValidOptionalTime = (value: unknown): value is string | null | undefined =>
  value === null || typeof value === 'undefined' || (typeof value === 'string' && (!value || isValidTimeInput(value)))

const isTodo = (value: unknown): value is PersistedTodo => {
  if (!value || typeof value !== 'object') return false

  const todo = value as Partial<PersistedTodo>

  return (
    typeof todo.id === 'string' &&
    todo.id.trim().length > 0 &&
    typeof todo.text === 'string' &&
    isTodoTextValid(todo.text) &&
    typeof todo.completed === 'boolean' &&
    isValidOptionalDate(todo.dueDate) &&
    isValidOptionalTime(todo.dueTime) &&
    typeof todo.createdAt === 'number' &&
    Number.isFinite(todo.createdAt)
  )
}

const normalizeTodo = (todo: PersistedTodo): Todo => ({
  ...todo,
  id: todo.id.trim(),
  text: normalizeTodoText(todo.text),
  dueDate: todo.dueDate && isValidDateInput(todo.dueDate) ? todo.dueDate : null,
  dueTime: todo.dueTime && isValidTimeInput(todo.dueTime) ? todo.dueTime : null,
})

export const serializeTodos = (todos: Todo[]): string => JSON.stringify({ version: 1, todos } satisfies PersistedTodos)

export const parseTodos = (raw: string | null): Todo[] => {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedTodos>

    if (parsed.version !== 1 || !Array.isArray(parsed.todos)) {
      return []
    }

    const seenIds = new Set<string>()

    return parsed.todos
      .filter(isTodo)
      .map(normalizeTodo)
      .filter((todo) => {
        if (seenIds.has(todo.id)) return false

        seenIds.add(todo.id)
        return true
      })
  } catch {
    return []
  }
}

export const loadTodos = (storage?: StorageLike): Todo[] => {
  if (!storage) return []

  try {
    return parseTodos(storage.getItem(TODOS_STORAGE_KEY))
  } catch {
    return []
  }
}

export const saveTodos = (todos: Todo[], storage?: StorageLike): void => {
  if (!storage) return

  try {
    storage.setItem(TODOS_STORAGE_KEY, serializeTodos(todos))
  } catch {
    // The in-memory state remains usable when browser storage is unavailable.
  }
}
