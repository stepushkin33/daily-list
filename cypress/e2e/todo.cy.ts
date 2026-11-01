describe('Daily List', () => {
  const getToday = (): string => {
    const date = new Date()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${date.getFullYear()}-${month}-${day}`
  }

  const setDateInput = (selector: string, value: string): void => {
    cy.get(selector).then(($input) => {
      const input = $input[0]
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set

      if (!input || !setter) {
        throw new Error(`Unable to set date input: ${selector}`)
      }

      setter.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.window().then((window) => {
      window.localStorage.setItem('daily-list:todos:v1', JSON.stringify({ version: 1, todos: [] }))
      window.localStorage.setItem('daily-list:demo-seeded:v1', 'true')
    })
    cy.reload()
  })

  it('adds a task, rejects empty input and persists it after reload', () => {
    cy.get('[data-testid="todo-input"]').type('Подготовить резюме')
    cy.contains('button', 'Добавить').click()
    cy.contains('Подготовить резюме').should('be.visible')

    cy.get('[data-testid="todo-input"]').clear()
    cy.contains('button', 'Добавить').click()
    cy.contains('Напишите задачу перед добавлением').should('be.visible')

    cy.reload()
    cy.contains('Подготовить резюме').should('be.visible')
  })

  it('toggles, filters and deletes a task', () => {
    cy.get('[data-testid="todo-input"]').type('Сделать заметки')
    cy.contains('button', 'Добавить').click()

    cy.get('[data-testid="todo-input"]').type('Отправить письмо')
    cy.contains('button', 'Добавить').click()

    cy.get('[aria-label="Выполнить задачу «Отправить письмо»"]').click()
    cy.contains('button', 'Выполненные').click()
    cy.contains('Отправить письмо').should('be.visible')
    cy.contains('Сделать заметки').should('not.exist')

    cy.get('[aria-label="Удалить задачу «Отправить письмо»"]').click()
    cy.contains('Здесь пока пусто').should('be.visible')
  })

  it('filters tasks by a calendar date', () => {
    setDateInput('[data-testid="todo-due-date"]', getToday())
    cy.get('[data-testid="todo-input"]').type('Встреча')
    cy.contains('button', 'Добавить').click()

    cy.get('[data-testid="calendar-trigger"]').click()
    cy.get('[data-testid="calendar-popover"]').should('be.visible')
    cy.contains('button', 'Сегодня').click()
    cy.contains('Встреча').should('be.visible')
    cy.get('[aria-label="Очистить период"]').click()
    cy.get('[data-testid="calendar-trigger"]').should('contain', 'Все даты')

    cy.get('[data-testid="calendar-trigger"]').click()
    cy.get('[data-testid="calendar-popover"]').should('be.visible')
    cy.get('[data-testid="calendar-trigger"]').click()
    cy.get('[data-testid="calendar-popover"]').should('not.exist')
  })
})
