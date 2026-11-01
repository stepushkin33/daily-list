import { parseDateInput } from '@/shared/lib/date/date'
import type { DateRange, Todo, TodoFilter } from './todo'

export interface TodoCounts {
  all: number
  active: number
  completed: number
}

const matchesStatus = (todo: Todo, filter: TodoFilter): boolean => {
  if (filter === 'active') return !todo.completed
  if (filter === 'completed') return todo.completed

  return true
}

const matchesDateRange = (todo: Todo, dateRange: DateRange): boolean => {
  if (!dateRange.from) return true

  return Boolean(todo.dueDate && todo.dueDate >= dateRange.from && todo.dueDate <= (dateRange.to || dateRange.from))
}

export const filterTodos = (todos: Todo[], filter: TodoFilter, dateRange: DateRange): Todo[] =>
  todos.filter((todo) => matchesStatus(todo, filter) && matchesDateRange(todo, dateRange))

export const countTodos = (todos: Todo[]): TodoCounts => {
  const counts: TodoCounts = { all: 0, active: 0, completed: 0 }

  for (const todo of todos) {
    counts.all += 1
    counts[todo.completed ? 'completed' : 'active'] += 1
  }

  return counts
}

export const isTodoOverdue = (todo: Todo, now = new Date()): boolean => {
  if (!todo.dueDate || todo.completed) return false

  const dueDate = parseDateInput(todo.dueDate)

  if (!dueDate) return false

  if (todo.dueTime) {
    const [hours, minutes] = todo.dueTime.split(':').map(Number)
    dueDate.setHours(hours, minutes, 0, 0)
  } else {
    dueDate.setHours(23, 59, 59, 999)
  }

  return dueDate.getTime() < now.getTime()
}
