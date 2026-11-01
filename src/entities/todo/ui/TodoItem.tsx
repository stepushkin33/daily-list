import { type Todo } from '../model/todo'
import { isTodoOverdue } from '../model/selectors'
import { formatShortDate, formatTimeInput } from '@/shared/lib/date/date'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

export const TodoItem = ({ todo, onToggle, onRemove }: TodoItemProps) => {
  const overdue = isTodoOverdue(todo)

  return (
    <li className={todo.completed ? 'todo-item todo-item-completed' : 'todo-item'}>
      <button
        className={todo.completed ? 'todo-checkbox todo-checkbox-checked' : 'todo-checkbox'}
        type="button"
        aria-label={todo.completed ? `Вернуть задачу «${todo.text}» в активные` : `Выполнить задачу «${todo.text}»`}
        aria-pressed={todo.completed}
        onClick={() => onToggle(todo.id)}
      >
        {todo.completed ? '✓' : null}
      </button>
      <div className="todo-item-body">
        <span className="todo-text">{todo.text}</span>
        {todo.dueDate ? (
          <span className={overdue ? 'todo-date todo-date-overdue' : 'todo-date'}>
            {overdue ? 'просрочено · ' : 'до '}
            {formatShortDate(todo.dueDate)}
            {todo.dueTime ? ` · ${formatTimeInput(todo.dueTime)}` : ''}
          </span>
        ) : null}
      </div>
      <button
        className="delete-button"
        type="button"
        aria-label={`Удалить задачу «${todo.text}»`}
        onClick={() => onRemove(todo.id)}
      >
        ×
      </button>
    </li>
  )
}
