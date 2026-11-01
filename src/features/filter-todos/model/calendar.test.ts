import { describe, expect, it } from 'vitest'

import { getCalendarDays } from './calendar'

describe('calendar model', () => {
  it('builds a stable six-week Monday-first grid', () => {
    const days = getCalendarDays(new Date(2026, 10, 1))

    expect(days).toHaveLength(42)
    expect(days[0]).toMatchObject({ value: '2026-10-26', day: 26, outsideMonth: true })
    expect(days[6]).toMatchObject({ value: '2026-11-01', day: 1, outsideMonth: false })
  })
})
