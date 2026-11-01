import { useRef, useState, type FormEvent } from 'react'

import { TODO_TEXT_MAX_LENGTH } from '@/entities/todo/model/todo'

interface TodoInputProps {
  onAdd: (text: string, dueDate: string, dueTime: string) => boolean
}

export const TodoInput = ({ onAdd }: TodoInputProps) => {
  const [text, setText] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    if (!onAdd(text, dueDate, dueTime)) {
      setError('Напишите задачу перед добавлением')
      inputRef.current?.focus()
      return
    }

    setText('')
    setDueDate('')
    setDueTime('')
    setError('')
    inputRef.current?.focus()
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <label className="sr-only" htmlFor="new-todo">
        Новая задача
      </label>
      <input
        ref={inputRef}
        id="new-todo"
        data-testid="todo-input"
        className={error ? 'todo-form-input input-invalid' : 'todo-form-input'}
        type="text"
        value={text}
        maxLength={TODO_TEXT_MAX_LENGTH}
        placeholder="Записать новую задачу..."
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'todo-input-error' : undefined}
        onChange={(event) => {
          setText(event.target.value)
          if (error) setError('')
        }}
      />
      <label className="date-field" title="Необязательная дата выполнения">
        <span className="input-meta-label" aria-hidden="true">
          до
        </span>
        <input
          data-testid="todo-due-date"
          type="date"
          value={dueDate}
          aria-label="Дата выполнения"
          onChange={(event) => setDueDate(event.target.value)}
        />
      </label>
      <label className="time-field" title="Необязательное время выполнения">
        <span className="input-meta-label" aria-hidden="true">
          в
        </span>
        <input
          data-testid="todo-due-time"
          type="time"
          value={dueTime}
          aria-label="Время выполнения"
          onChange={(event) => setDueTime(event.target.value)}
        />
      </label>
      <button className="add-button" type="submit">
        Добавить
      </button>
      {error ? (
        <span id="todo-input-error" className="form-error">
          {error}
        </span>
      ) : null}
    </form>
  )
}
