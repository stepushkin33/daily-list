import { isValidDateInput, isValidTimeInput } from '@/shared/lib/date/date'

export type TodoFilter = 'all' | 'active' | 'completed'

export interface DateRange {
  from: string
  to: string
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  dueDate: string | null
  dueTime: string | null
  createdAt: number
}

export const TODOS_STORAGE_KEY = 'daily-list:todos:v1'
export const TODO_TEXT_MAX_LENGTH = 160
export const DEMO_SEEDED_STORAGE_KEY = 'daily-list:demo-seeded:v1'

export const normalizeTodoText = (text: string): string => text.trim().slice(0, TODO_TEXT_MAX_LENGTH)

export const isTodoTextValid = (text: string): boolean => normalizeTodoText(text).length > 0

export const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const createTodo = (text: string, dueDate: string | null = null, dueTime: string | null = null): Todo => ({
  id: createId(),
  text: normalizeTodoText(text),
  completed: false,
  dueDate: dueDate && isValidDateInput(dueDate) ? dueDate : null,
  dueTime: dueTime && isValidTimeInput(dueTime) ? dueTime : null,
  createdAt: Date.now(),
})
