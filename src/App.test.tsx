import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { StrictMode } from 'react'

import { App } from '@/app/App'
import { serializeTodos } from '@/entities/todo/model/storage'
import { DEMO_SEEDED_STORAGE_KEY, TODOS_STORAGE_KEY } from '@/entities/todo/model/todo'

afterEach(cleanup)

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(TODOS_STORAGE_KEY, serializeTodos([]))
  localStorage.setItem(DEMO_SEEDED_STORAGE_KEY, 'true')
})

describe('Daily List', () => {
  it('adds a trimmed task and rejects whitespace-only input', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Добавить' }))
    expect(screen.getByText('Напишите задачу перед добавлением')).toBeInTheDocument()

    await user.type(screen.getByTestId('todo-input'), '  Купить молоко  ')
    await user.click(screen.getByRole('button', { name: 'Добавить' }))

    expect(screen.getByText('Купить молоко')).toBeInTheDocument()
    expect(screen.queryByText('  Купить молоко  ')).not.toBeInTheDocument()
  })

  it('toggles, filters and removes tasks', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByTestId('todo-input')
    await user.type(input, 'Первая задача')
    await user.click(screen.getByRole('button', { name: 'Добавить' }))
    await user.type(input, 'Вторая задача')
    await user.click(screen.getByRole('button', { name: 'Добавить' }))

    await user.click(screen.getByRole('button', { name: 'Выполнить задачу «Вторая задача»' }))
    await user.click(screen.getByRole('button', { name: /Выполненные/ }))
    expect(screen.getByText('Вторая задача')).toBeInTheDocument()
    expect(screen.queryByText('Первая задача')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Удалить задачу «Вторая задача»/ }))
    expect(screen.getByText('Здесь пока пусто')).toBeInTheDocument()
  })

  it('persists tasks after remounting the app', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)

    await user.type(screen.getByTestId('todo-input'), 'Сохранённая задача')
    await user.click(screen.getByRole('button', { name: 'Добавить' }))
    firstRender.unmount()
    render(<App />)

    expect(screen.getByText('Сохранённая задача')).toBeInTheDocument()
  })

  it('clears only the date period with the cross button', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByTestId('calendar-trigger'))
    await user.click(screen.getByRole('button', { name: 'Сегодня' }))

    expect(screen.getByRole('button', { name: 'Очистить период' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Очистить период' }))

    expect(screen.getByTestId('calendar-trigger')).toHaveTextContent('Все даты')
    expect(screen.queryByRole('button', { name: 'Очистить период' })).not.toBeInTheDocument()
  })

  it('keeps demo tasks on the first Strict Mode render', () => {
    localStorage.clear()

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )

    expect(screen.getByText('Сверить план на день')).toBeInTheDocument()
  })
})
