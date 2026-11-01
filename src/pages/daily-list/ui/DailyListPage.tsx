import { useState } from 'react'

import { countTodos, filterTodos } from '@/entities/todo/model/selectors'
import { type DateRange, type TodoFilter } from '@/entities/todo/model/todo'
import { TodoItem } from '@/entities/todo/ui/TodoItem'
import { TodoInput } from '@/features/create-todo/ui/TodoInput'
import { TodoFilters } from '@/features/filter-todos/ui/TodoFilters'
import { CalendarFilter } from '@/features/filter-todos/ui/CalendarFilter'
import { useTodos } from '@/features/manage-todos/model/use-todos'
import { formatLongDate, toDateInputValue } from '@/shared/lib/date/date'

export const DailyListPage = () => {
  const { todos, addTodo, toggleTodo, removeTodo, clearCompleted } = useTodos()
  const [activeFilter, setActiveFilter] = useState<TodoFilter>('all')
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })
  const counts = countTodos(todos)
  const visibleTodos = filterTodos(todos, activeFilter, dateRange)
  const today = toDateInputValue()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">
          <img src="/logo.svg" alt="" />
        </div>
        <div>
          <p className="brand-name">Daily List</p>
        </div>
        <time className="header-date" dateTime={today}>
          {formatLongDate()}
        </time>
      </header>

      <main className="notebook-page">
        <div className="page-margin-line" aria-hidden="true" />
        <section className="page-intro" aria-labelledby="page-title">
          <div>
            <h1 id="page-title">Мои задачи</h1>
            <p className="page-description">Записывай важное, отмечай сделанное, освобождай голову.</p>
          </div>
          <div className="task-sticker" aria-label={`${counts.active} активных задач`}>
            <span className="sticker-number">{counts.active}</span>
            <span className="sticker-caption">
              осталось
              <br />
              сделать
            </span>
          </div>
        </section>

        <TodoInput onAdd={addTodo} />

        <section className="task-toolbar" aria-label="Управление списком задач">
          <TodoFilters activeFilter={activeFilter} counts={counts} onChange={setActiveFilter} />
          <CalendarFilter dateRange={dateRange} onChange={setDateRange} />
        </section>

        <section className="tasks-section" aria-labelledby="tasks-heading">
          <div className="section-heading">
            <h2 id="tasks-heading">Список дел</h2>
            <span className="section-count">
              {visibleTodos.length} из {todos.length}
            </span>
          </div>

          {visibleTodos.length ? (
            <ol className="todo-list" data-testid="todo-list">
              {visibleTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onRemove={removeTodo} />
              ))}
            </ol>
          ) : (
            <div className="empty-state">
              <span className="empty-doodle" aria-hidden="true">
                ✦
              </span>
              <h3>{todos.length ? 'Здесь пока пусто' : 'Страница ждёт первую задачу'}</h3>
              <p>
                {todos.length
                  ? 'Попробуйте выбрать другой фильтр или дату.'
                  : 'Добавьте дело выше — оно останется здесь после обновления страницы.'}
              </p>
            </div>
          )}
        </section>

        <div className="page-actions">
          <button className="clear-button" type="button" disabled={!counts.completed} onClick={clearCompleted}>
            Убрать выполненные
          </button>
        </div>
      </main>
    </div>
  )
}
