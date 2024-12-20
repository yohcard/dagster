// https://on.cypress.io/api

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login'); // Assurez-vous que l'URL correspond à votre page de connexion
  });

  it('affiche des erreurs si les champs sont vides', () => {
    cy.get('button[type="submit"]').click(); // Soumet le formulaire
    cy.contains('Vous devez renseigner ce champ').should('exist'); // Vérifie le message d'erreur
  });

  it('Connexion avec des informations valide', () => {
    cy.intercept('POST', '/api/auth', {
      statusCode: 200,
      body: {
        token: 'fake-token',
        user: { id: 1, email: 'cypress@test.com'}
      }
    }).as('authRequest')

    cy.get('input[name=email]').type('cypress@test.com')
    cy.get('input[name=password]').type('cypressPassword')

    cy.get('button[type=submit]').click()

    cy.wait('@authRequest')
  })
})
