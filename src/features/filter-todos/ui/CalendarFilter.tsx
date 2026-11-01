import { useEffect, useMemo, useRef, useState } from 'react'

import { formatMonthLabel, formatShortDate, parseDateInput, toDateInputValue } from '@/shared/lib/date/date'
import type { DateRange } from '@/entities/todo/model/todo'
import { addMonths, getCalendarDays, getMonthStart } from '../model/calendar'

interface CalendarFilterProps {
  dateRange: DateRange
  onChange: (dateRange: DateRange) => void
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const formatRange = (dateRange: DateRange): string => {
  if (!dateRange.from) return 'Все даты'
  if (!dateRange.to || dateRange.from === dateRange.to) return formatShortDate(dateRange.from)

  return `${formatShortDate(dateRange.from)} — ${formatShortDate(dateRange.to)}`
}

export const CalendarFilter = ({ dateRange, onChange }: CalendarFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [draftRange, setDraftRange] = useState<DateRange>(dateRange)
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(new Date()))
  const wrapperRef = useRef<HTMLDivElement>(null)
  const days = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth])
  const monthLabel = formatMonthLabel(visibleMonth)
  const today = toDateInputValue()

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent): void => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) setDraftRange(dateRange)
  }, [dateRange, isOpen])

  const selectDay = (value: string): void => {
    if (!draftRange.from || draftRange.to) {
      setDraftRange({ from: value, to: '' })
      return
    }

    setDraftRange(value < draftRange.from ? { from: value, to: draftRange.from } : { from: draftRange.from, to: value })
  }

  const applyRange = (): void => {
    if (!draftRange.from) return

    onChange({ from: draftRange.from, to: draftRange.to || draftRange.from })
    setIsOpen(false)
  }

  const clearRange = (): void => {
    setDraftRange({ from: '', to: '' })
    onChange({ from: '', to: '' })
    setIsOpen(false)
  }

  const selectToday = (): void => {
    const todayRange = { from: today, to: today }

    setDraftRange(todayRange)
    onChange(todayRange)
    setVisibleMonth(getMonthStart(new Date()))
    setIsOpen(false)
  }

  const toggleCalendar = (): void => {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    const selectedDate = dateRange.from ? parseDateInput(dateRange.from) : null

    setDraftRange(dateRange)
    setVisibleMonth(getMonthStart(selectedDate ?? new Date()))
    setIsOpen(true)
  }

  return (
    <div ref={wrapperRef} className="calendar-filter">
      <div className="calendar-control-row">
        {dateRange.from ? (
          <button
            className="date-clear-button"
            type="button"
            aria-label="Очистить период"
            title="Очистить выбор дат"
            onClick={clearRange}
          >
            ×
          </button>
        ) : null}
        <button
          className={isOpen || dateRange.from ? 'calendar-trigger calendar-trigger-active' : 'calendar-trigger'}
          type="button"
          data-testid="calendar-trigger"
          aria-expanded={isOpen}
          aria-controls="calendar-popover"
          onClick={toggleCalendar}
        >
          <span className="calendar-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path d="M4 5h16l-6.5 7.4v5.1L10.5 19v-6.6L4 5Z" />
            </svg>
          </span>
          <span className="calendar-trigger-copy">
            <small>Период</small>
            <strong>{formatRange(dateRange)}</strong>
          </span>
          <span className="calendar-chevron" aria-hidden="true">
            <svg viewBox="0 0 16 16" role="presentation">
              <path d="m3.5 6 4.5 4.5L12.5 6" />
            </svg>
          </span>
        </button>
      </div>

      {isOpen ? (
        <div
          id="calendar-popover"
          className="calendar-popover"
          data-testid="calendar-popover"
          role="dialog"
          aria-label="Выбор периода"
        >
          <div className="calendar-popover-head">
            <button
              className="calendar-nav-button"
              type="button"
              aria-label="Предыдущий месяц"
              onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            >
              ‹
            </button>
            <strong>{monthLabel}</strong>
            <button
              className="calendar-nav-button"
              type="button"
              aria-label="Следующий месяц"
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            >
              ›
            </button>
          </div>
          <div className="calendar-weekdays" aria-hidden="true">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {days.map((day) => {
              const isStart = draftRange.from === day.value
              const isEnd = draftRange.to === day.value
              const isInRange = Boolean(
                draftRange.from && draftRange.to && day.value > draftRange.from && day.value < draftRange.to,
              )

              return (
                <button
                  key={day.value}
                  className={[
                    'calendar-day',
                    day.outsideMonth ? 'calendar-day-outside' : '',
                    isInRange ? 'calendar-day-in-range' : '',
                    isStart || isEnd ? 'calendar-day-selected' : '',
                    day.value === today ? 'calendar-day-today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  type="button"
                  data-date={day.value}
                  aria-label={day.value}
                  aria-pressed={isStart || isEnd}
                  onClick={() => selectDay(day.value)}
                >
                  {day.day}
                </button>
              )
            })}
          </div>
          <p className="calendar-hint">
            {draftRange.from && !draftRange.to ? 'Теперь выберите последний день' : 'Выберите начало и конец периода'}
          </p>
          <div className="calendar-quick-actions">
            <button className="calendar-secondary-button" type="button" onClick={selectToday}>
              Сегодня
            </button>
            <button className="calendar-secondary-button" type="button" onClick={clearRange}>
              Сбросить
            </button>
            <button className="calendar-apply-button" type="button" disabled={!draftRange.from} onClick={applyRange}>
              Применить
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
