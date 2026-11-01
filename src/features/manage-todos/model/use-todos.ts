import { useCallback, useEffect, useReducer } from 'react'

import { loadTodos, saveTodos } from '@/entities/todo/model/storage'
import { createTodo, DEMO_SEEDED_STORAGE_KEY, isTodoTextValid, type Todo } from '@/entities/todo/model/todo'
import { todosReducer } from '@/entities/todo/model/todo-reducer'
import { createDemoTodos } from '@/entities/todo/model/todo-seed'

const getStorage = (): Storage | undefined => {
  if (typeof window === 'undefined') return undefined

  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

const getInitialTodos = (storage: Storage | undefined): Todo[] => {
  const loadedTodos = loadTodos(storage)
  let hasSeededDemo = false

  try {
    hasSeededDemo = storage?.getItem(DEMO_SEEDED_STORAGE_KEY) === 'true'
  } catch {
    hasSeededDemo = false
  }

  return !hasSeededDemo && loadedTodos.length === 0 ? createDemoTodos() : loadedTodos
}

const markDemoAsSeeded = (storage: Storage | undefined): void => {
  try {
    if (!storage || storage.getItem(DEMO_SEEDED_STORAGE_KEY) === 'true') return

    storage.setItem(DEMO_SEEDED_STORAGE_KEY, 'true')
  } catch {
    // The list remains usable when browser storage is unavailable.
  }
}

export const useTodos = () => {
  const [todos, dispatch] = useReducer(todosReducer, undefined, () => getInitialTodos(getStorage()))

  useEffect(() => {
    const storage = getStorage()

    markDemoAsSeeded(storage)
    saveTodos(todos, storage)
  }, [todos])

  const addTodo = useCallback((text: string, dueDate: string, dueTime: string): boolean => {
    if (!isTodoTextValid(text)) return false

    dispatch({ type: 'add', todo: createTodo(text, dueDate, dueTime) })
    return true
  }, [])

  const toggleTodo = useCallback((id: string): void => {
    dispatch({ type: 'toggle', id })
  }, [])

  const removeTodo = useCallback((id: string): void => {
    dispatch({ type: 'remove', id })
  }, [])

  const clearCompleted = useCallback((): void => {
    dispatch({ type: 'clear-completed' })
  }, [])

  return { todos, addTodo, toggleTodo, removeTodo, clearCompleted }
}
