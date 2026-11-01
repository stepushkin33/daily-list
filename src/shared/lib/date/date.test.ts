import { describe, expect, it } from 'vitest'

import { formatShortDate, isValidDateInput, isValidTimeInput, parseDateInput, toDateInputValue } from './date'

describe('date helpers', () => {
  it('validates calendar and time input values', () => {
    expect(isValidDateInput('2026-02-28')).toBe(true)
    expect(isValidDateInput('2026-02-29')).toBe(false)
    expect(isValidTimeInput('09:30')).toBe(true)
    expect(isValidTimeInput('24:00')).toBe(false)
  })

  it('uses local calendar dates without timezone shifts', () => {
    const date = parseDateInput('2026-11-01')

    expect(date).not.toBeNull()
    expect(toDateInputValue(date!)).toBe('2026-11-01')
    expect(formatShortDate('not-a-date')).toBe('')
  })
})
