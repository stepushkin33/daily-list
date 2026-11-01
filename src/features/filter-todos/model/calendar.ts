import { toDateInputValue } from '@/shared/lib/date/date'

export interface CalendarDay {
  value: string
  day: number
  outsideMonth: boolean
}

export const getMonthStart = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1)

export const addMonths = (date: Date, amount: number): Date => new Date(date.getFullYear(), date.getMonth() + amount, 1)

export const getCalendarDays = (month: Date): CalendarDay[] => {
  const firstDayOffset = (month.getDay() + 6) % 7

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(month.getFullYear(), month.getMonth(), index - firstDayOffset + 1)

    return {
      value: toDateInputValue(date),
      day: date.getDate(),
      outsideMonth: date.getMonth() !== month.getMonth(),
    }
  })
}
