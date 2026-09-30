describe('Authentication Flow', () => {
  it('should login successfully with valid credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Welcome back');
  });

  it('should show error with invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('[data-cy="error-message"]').should('be.visible');
  });

  it('should logout successfully', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should('include', '/login');
  });

  it('should refresh token automatically', () => {
    cy.visit('/dashboard');
    cy.wait(6000 * 60); // Wait 6 minutes
    cy.get('h1').should('contain', 'Welcome back');
  });
});
