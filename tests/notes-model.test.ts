import { describe, expect, it } from 'vitest'

import {
  cloneNote,
  NOTE_TITLE_MAX_LENGTH,
  sortNotesByUpdatedAt,
  TODO_DESCRIPTION_MAX_LENGTH,
  TODO_TEXT_MAX_LENGTH,
  type Note,
} from '../entities/note/model/note'

const note = (id: string, updatedAt: number): Note => ({
  id,
  title: id,
  todos: [],
  updatedAt,
})

describe('note helpers', () => {
  it('sorts notes by updated date without mutating the source collection', () => {
    const notes = [note('old', 1), note('new', 3), note('middle', 2)]

    expect(sortNotesByUpdatedAt(notes, 'updated-desc').map((item) => item.id)).toEqual(['new', 'middle', 'old'])
    expect(sortNotesByUpdatedAt(notes, 'updated-asc').map((item) => item.id)).toEqual(['old', 'middle', 'new'])
    expect(notes.map((item) => item.id)).toEqual(['old', 'new', 'middle'])
  })

  it('normalizes text lengths when cloning notes', () => {
    const cloned = cloneNote({
      id: 'limited',
      title: 'a'.repeat(NOTE_TITLE_MAX_LENGTH + 1),
      todos: [
        {
          id: 'todo-limited',
          text: 'b'.repeat(TODO_TEXT_MAX_LENGTH + 1),
          description: 'c'.repeat(TODO_DESCRIPTION_MAX_LENGTH + 1),
          completed: false,
        },
      ],
      updatedAt: 1,
    })

    expect(cloned.title).toHaveLength(NOTE_TITLE_MAX_LENGTH)
    expect(cloned.todos[0]?.text).toHaveLength(TODO_TEXT_MAX_LENGTH)
    expect(cloned.todos[0]?.description).toHaveLength(TODO_DESCRIPTION_MAX_LENGTH)
  })
})
