// https://on.cypress.io/api

describe('Signin', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('Affiche des erreurs si les champs sont vides', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Vous devez renseigner ce champ').should('exist'); // Vérifie le message d'erreur
  });

  it('Connexion avec des information valides', () => {
    cy.intercept('POST', '/api/user/add', {
      statusCode: 200,
      body: { token: 'fake-token' }
    }).as('loginRequest');

    cy.get('input[name=email]').type('cypress@test.com');
    cy.get('input[name=password]').type('cypressPassword');
    cy.get('input[name=confirmation]').type('cypressPassword');

    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('eq', Cypress.config().baseUrl + '/login');
  });

  it('Affiche des erreurs si deux mot de passe différent', () => {
    cy.get('input[name=email]').type('cypress@test.com');
    cy.get('input[name=password]').type('cypressPassword');
    cy.get('input[name=confirmation]').type('notthesamepassword');

    cy.get('button[type="submit"]').click();

    cy.contains('Les mots de passe ne correspondent pas').should('exist');
  });

  it('Affiche des erreurs si pas de confirmation', () => {
    cy.get('input[name=email]').type('cypress@test.com');
    cy.get('input[name=password]').type('cypressPassword');

    cy.get('button[type="submit"]').click();

    cy.contains('Vous devez renseigner ce champ').should('exist');
  });
});
