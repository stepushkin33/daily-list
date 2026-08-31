import type { Note } from './note'

export const createSeedNotes = (): Note[] => {
  const updatedAt = Date.now()

  return [
    {
      id: 'note-week-plan',
      title: 'План на неделю',
      todos: [
        { id: 'todo-week-1', text: 'Сверстать первый экран', description: '', completed: true },
        { id: 'todo-week-2', text: 'Проверить адаптивность', description: '', completed: false },
        { id: 'todo-week-3', text: 'Подготовить заметки к демо', description: '', completed: false },
        { id: 'todo-week-4', text: 'Запланировать ретро', description: '', completed: false },
      ],
      updatedAt,
    },
    {
      id: 'note-reading-list',
      title: 'Что почитать',
      todos: [
        { id: 'todo-reading-1', text: 'Designing Data-Intensive Applications', description: '', completed: false },
        { id: 'todo-reading-2', text: 'The Mom Test', description: '', completed: true },
        { id: 'todo-reading-3', text: 'Refactoring UI', description: '', completed: false },
      ],
      updatedAt: updatedAt - 86_400_000,
    },
    {
      id: 'note-ideas',
      title: 'Идеи для проекта',
      todos: [
        { id: 'todo-ideas-1', text: 'Добавить быстрый поиск', description: '', completed: false },
        { id: 'todo-ideas-2', text: 'Собрать экран статистики', description: '', completed: false },
      ],
      updatedAt: updatedAt - 172_800_000,
    },
  ]
}
