import { describe, expect, it } from 'vitest'

import { parseTodos, serializeTodos } from './storage'
import type { Todo } from './todo'

const todo: Todo = {
  id: 'todo-1',
  text: 'Проверить localStorage',
  completed: false,
  dueDate: '2026-11-02',
  dueTime: '14:30',
  createdAt: 1,
}

describe('todo storage', () => {
  it('round-trips versioned data', () => {
    expect(parseTodos(serializeTodos([todo]))).toEqual([todo])
  })

  it('returns an empty list for invalid or unsupported data', () => {
    expect(parseTodos('{"version":99,"todos":[]}')).toEqual([])
    expect(parseTodos('{not-json')).toEqual([])
    expect(parseTodos(null)).toEqual([])
  })

  it('drops malformed and duplicate tasks while keeping valid data', () => {
    const parsed = parseTodos(
      JSON.stringify({
        version: 1,
        todos: [
          todo,
          { ...todo, text: 'Дубликат' },
          { ...todo, id: 'invalid-date', dueDate: '2026-02-30' },
          { ...todo, id: 'second', text: '  Вторая задача  ', dueTime: undefined },
        ],
      }),
    )

    expect(parsed).toEqual([
      todo,
      {
        ...todo,
        id: 'second',
        text: 'Вторая задача',
        dueTime: null,
      },
    ])
  })
})
