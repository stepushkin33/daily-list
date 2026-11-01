import type { Todo } from './todo'

export type TodoAction =
  | { type: 'add'; todo: Todo }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clear-completed' }

export const todosReducer = (state: Todo[], action: TodoAction): Todo[] => {
  switch (action.type) {
    case 'add':
      return [action.todo, ...state]
    case 'toggle':
      return state.map((todo) => (todo.id === action.id ? { ...todo, completed: !todo.completed } : todo))
    case 'remove':
      return state.filter((todo) => todo.id !== action.id)
    case 'clear-completed':
      return state.filter((todo) => !todo.completed)
    default:
      return state
  }
}
