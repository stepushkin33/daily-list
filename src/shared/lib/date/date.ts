const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_INPUT_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const longDateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' })

export const toDateInputValue = (date = new Date()): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const parseDateInput = (value: string): Date | null => {
  const match = DATE_INPUT_PATTERN.exec(value)

  if (!match) return null

  const [, yearValue, monthValue, dayValue] = match
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)
  const date = new Date(year, month - 1, day, 12)

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export const isValidDateInput = (value: string): boolean => parseDateInput(value) !== null

export const isValidTimeInput = (value: string): boolean => TIME_INPUT_PATTERN.test(value)

export const formatShortDate = (value: string): string => {
  const date = parseDateInput(value)

  return date ? shortDateFormatter.format(date) : ''
}

export const formatTimeInput = (value: string): string => value.slice(0, 5)

export const formatLongDate = (date = new Date()): string => longDateFormatter.format(date)

export const formatMonthLabel = (date: Date): string => monthFormatter.format(date)
