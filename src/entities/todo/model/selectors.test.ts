import { describe, expect, it } from 'vitest'

import { countTodos, filterTodos, isTodoOverdue } from './selectors'
import type { Todo } from './todo'

const todos: Todo[] = [
  { id: 'active', text: 'Активная', completed: false, dueDate: '2026-11-04', dueTime: null, createdAt: 1 },
  { id: 'completed', text: 'Готовая', completed: true, dueDate: null, dueTime: null, createdAt: 2 },
  { id: 'overdue', text: 'Просроченная', completed: false, dueDate: '2026-10-30', dueTime: null, createdAt: 3 },
]

describe('todo selectors', () => {
  it('filters by status and selected calendar date', () => {
    expect(filterTodos(todos, 'active', { from: '', to: '' })).toHaveLength(2)
    expect(filterTodos(todos, 'completed', { from: '', to: '' })).toHaveLength(1)
    expect(filterTodos(todos, 'all', { from: '2026-11-04', to: '2026-11-05' }).map((todo) => todo.id)).toEqual([
      'active',
    ])
  })

  it('counts statuses and identifies overdue active tasks', () => {
    expect(countTodos(todos)).toEqual({ all: 3, active: 2, completed: 1 })
    expect(isTodoOverdue(todos[2]!, new Date('2026-11-01T12:00:00'))).toBe(true)
    expect(isTodoOverdue(todos[1]!, new Date('2026-11-01T12:00:00'))).toBe(false)
  })
})
