describe('Booking Flow', () => {
  beforeEach(() => {
    cy.visit('/therapist');
    cy.get('[data-cy="therapist-card"]').first().click();
  });

  it('should complete 5-step booking process', () => {
    // Step 1: Session Type
    cy.get('[data-cy="session-type-video"]').click();
    cy.get('[data-cy="booking-next"]').click();

    // Step 2: Date/Time
    cy.get('[data-cy="date-picker"]').click();
    cy.get('[data-cy="calendar-day-15"]').click();
    cy.get('[data-cy="time-slot-10am"]').click();
    cy.get('[data-cy="booking-next"]').click();

    // Step 3: Duration
    cy.get('[data-cy="duration-60"]').click();
    cy.get('[data-cy="booking-next"]').click();

    // Step 4: Confirmation
    cy.get('[data-cy="price"]').should('contain', '₹');
    cy.get('[data-cy="booking-next"]').click();

    // Step 5: Success
    cy.get('[data-cy="success-message"]').should('be.visible');
    cy.get('[data-cy="go-to-appointments"]').click();
    cy.url().should('include', '/appointments');
  });

  it('should show price calculation correctly', () => {
    cy.get('[data-cy="session-type-video"]').click();
    cy.get('[data-cy="booking-next"]').click();
    cy.get('[data-cy="date-picker"]').click();
    cy.get('[data-cy="calendar-day-15"]').click();
    cy.get('[data-cy="time-slot-10am"]').click();
    cy.get('[data-cy="booking-next"]').click();

    cy.get('[data-cy="duration-30"]').click();
    cy.get('[data-cy="booking-next"]').click();
    cy.get('[data-cy="price"]').should('contain', '₹500');
  });

  it('should cancel booking and return to therapist list', () => {
    cy.get('[data-cy="booking-cancel"]').click();
    cy.url().should('include', '/therapist');
  });
});
