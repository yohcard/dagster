describe('Todo', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.intercept('POST', '/api/auth', {
      statusCode: 200,
      body: {
        token: 'fake-token',
        user: { id: 1, email: 'cypress@test.com' }
      }
    }).as('authRequest');

    cy.get('input[name=email]').type('cypress@test.com');
    cy.get('input[name=password]').type('cypressPassword');

    cy.get('button[type=submit]').click();

    cy.wait('@authRequest');
  });

  // it('Affiche tous les todos', () => {
  //   cy.intercept('GET', 'api/todo/', {
  //     statusCode: 200,
  //     body: {
  //       todo: {
  //         text: 'Cypress test',
  //         completed: false,
  //         user_id: 1
  //       }
  //     }
  //   }).as('GETtodoRequest');

  //   cy.wait('@GETtodoRequest');
  // });

  it('Créer un todo valide', () => {
    cy.visit('/');
    cy.intercept('POST', '/api/todo/add', {
      statusCode: 200
    }).as('POSTtodoRequest');

    cy.get('input[name=text]').type('cypressTodo');
    cy.get('button[type=submit]').click();

    cy.wait('@POSTtodoRequest');
  });
});
