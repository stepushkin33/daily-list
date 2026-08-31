describe('Note Space', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearLocalStorage()
    cy.reload()
  })

  it('keeps overview todo markers passive and opens a note from the whole card', () => {
    cy.get('.preview-marker').should('have.length.greaterThan', 0)
    cy.get('.preview-marker').each(($marker) => {
      expect($marker.prop('tagName')).to.equal('SPAN')
      expect($marker.attr('aria-hidden')).to.equal('true')
    })

    cy.get('.note-card')
      .first()
      .within(() => {
        cy.get('.note-card-link').should('have.attr', 'href', '/notes/note-week-plan')
        cy.get('.preview-text').first().click()
      })

    cy.location('pathname').should('eq', '/notes/note-week-plan')
  })

  it('disables undo and redo until the corresponding history branch exists', () => {
    cy.visit('/notes/note-week-plan')

    cy.get('[aria-label="Отменить изменение"]').should('be.disabled')
    cy.get('[aria-label="Повторить изменение"]').should('be.disabled')

    cy.get('.todo-checkbox').first().click()
    cy.get('[aria-label="Отменить изменение"]').should('not.be.disabled')
    cy.get('[aria-label="Повторить изменение"]').should('be.disabled')

    cy.get('[aria-label="Отменить изменение"]').click()
    cy.get('[aria-label="Отменить изменение"]').should('be.disabled')
    cy.get('[aria-label="Повторить изменение"]').should('not.be.disabled')
  })

  it('enforces text limits and expands a long todo description', () => {
    cy.visit('/notes/new')

    cy.get('#note-title').type('a'.repeat(100)).should('have.value', 'a'.repeat(80))
    cy.contains('button', 'Добавить пункт').click()

    cy.get('input[data-todo-input]').type('b'.repeat(150)).should('have.value', 'b'.repeat(120))

    const description = 'Описание задачи. '.repeat(40)
    cy.get('textarea[data-todo-description]').type(description).should('have.value', description.slice(0, 500))
    cy.contains('button', 'Развернуть').should('be.visible').click()
    cy.get('textarea[data-todo-description]').should('have.class', 'todo-description-input-expanded')
    cy.contains('button', 'Свернуть').should('be.visible')
  })

  it('closes a destructive confirmation modal with Escape', () => {
    cy.get('.card-delete').first().click()
    cy.get('[role="dialog"]').should('be.visible').type('{esc}')
    cy.get('[role="dialog"]').should('not.exist')
  })
})
