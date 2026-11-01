import { describe, expect, it } from 'vitest'

import { todosReducer } from './todo-reducer'
import type { Todo } from './todo'

const firstTodo: Todo = {
  id: 'first',
  text: 'Первая задача',
  completed: false,
  dueDate: null,
  dueTime: null,
  createdAt: 1,
}

describe('todosReducer', () => {
  it('adds, toggles and removes a task immutably', () => {
    const added = todosReducer([], { type: 'add', todo: firstTodo })
    const toggled = todosReducer(added, { type: 'toggle', id: firstTodo.id })
    const removed = todosReducer(toggled, { type: 'remove', id: firstTodo.id })

    expect(added).toEqual([firstTodo])
    expect(toggled[0]?.completed).toBe(true)
    expect(removed).toEqual([])
    expect(firstTodo.completed).toBe(false)
  })

  it('clears only completed tasks', () => {
    const completed = { ...firstTodo, completed: true }
    const active = { ...firstTodo, id: 'active', text: 'Активная задача' }

    expect(todosReducer([completed, active], { type: 'clear-completed' })).toEqual([active])
  })
})
