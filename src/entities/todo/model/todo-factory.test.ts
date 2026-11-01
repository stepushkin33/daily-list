import { describe, expect, it } from 'vitest'

import { createTodo } from './todo'

describe('createTodo', () => {
  it('normalizes text and rejects invalid date metadata', () => {
    const todo = createTodo('  Новая задача  ', '2026-02-30', '25:00')

    expect(todo.text).toBe('Новая задача')
    expect(todo.dueDate).toBeNull()
    expect(todo.dueTime).toBeNull()
    expect(todo.completed).toBe(false)
  })
})
