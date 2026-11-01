import { toDateInputValue } from '@/shared/lib/date/date'
import { createTodo, type Todo } from './todo'

const dateAfter = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)

  return toDateInputValue(date)
}

export const createDemoTodos = (): Todo[] => [
  { ...createTodo('Сверить план на день', dateAfter(0), '09:30'), id: 'demo-today-plan' },
  { ...createTodo('Разобрать входящие письма', dateAfter(0), '16:00'), id: 'demo-today-mail', completed: true },
  { ...createTodo('Подготовить вопросы к созвону', dateAfter(1), '11:00'), id: 'demo-tomorrow-call' },
  { ...createTodo('Забронировать столик на выходные', dateAfter(2), '18:30'), id: 'demo-day-three-table' },
  { ...createTodo('Собрать вещи для поездки', dateAfter(4), '10:00'), id: 'demo-day-five-trip' },
]
