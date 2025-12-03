describe('StartScreen - E2E Tests', () => {
  beforeEach(() => {
    cy.mockApiResponses();
    cy.visit('/');
  });

  describe('Happy Paths', () => {
    it('should display the start screen with all elements', () => {
      // Check logo is visible
      cy.get('img[alt="Bureaucracy Simulator"]').should('be.visible');
      
      // Check nickname input exists
      cy.get('input[placeholder="Nickname..."]').should('be.visible');
      
      // Check Play button exists
      cy.get('button').contains('Play').should('be.visible');
      
      // Check navigation buttons exist
      cy.get('button').should('have.length.at.least', 4); // Play + 3 icon buttons
    });

    it('should accept valid nickname input', () => {
      const nickname = 'TestPlayer123';
      cy.get('input[placeholder="Nickname..."]')
        .type(nickname)
        .should('have.value', nickname);
    });

    it('should start game with valid nickname', () => {
      cy.mockApiResponses();
      
      cy.get('input[placeholder="Nickname..."]').type('TestPlayer');
      cy.get('button').contains('Play').click();
      
      cy.wait('@postUser');
      cy.url().should('include', '/game');
    });

    it('should respect 20 character nickname limit', () => {
      const longNickname = 'ThisIsAVeryLongNickname123456';
      const expectedNickname = longNickname.substring(0, 20);
      
      cy.get('input[placeholder="Nickname..."]')
        .type(longNickname)
        .should('have.value', expectedNickname);
    });

    it('should navigate to leaderboard when clicking star button', () => {
      cy.mockLeaderboard();
      
      // Find and click the star button (first icon button at bottom)
      cy.get('button').filter(':has(svg)').eq(0).click();
      
      cy.url().should('include', '/leaderboard');
    });

    it('should navigate to credits when clicking user button', () => {
      cy.mockAboutUs();
      
      // Find and click the user/credits button (second icon button at bottom)
      cy.get('button').filter(':has(svg)').eq(1).click();
      
      cy.url().should('include', '/credits');
    });
  });

  describe('Unhappy Paths', () => {
    it('should show alert when submitting empty nickname', () => {
      // Stub the alert
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });

      cy.get('button').contains('Play').click();
      
      // Alert should be called
      cy.get('@alertStub').should('have.been.calledWith', 'Please enter a nickname!');
      
      // Should stay on start screen
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should show alert when submitting whitespace-only nickname', () => {
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });

      cy.get('input[placeholder="Nickname..."]').type('   ');
      cy.get('button').contains('Play').click();
      
      cy.get('@alertStub').should('have.been.calledWith', 'Please enter a nickname!');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should handle API error gracefully when starting game', () => {
      cy.mockApiError('**/user/', 'POST');
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });

      cy.get('input[placeholder="Nickname..."]').type('TestPlayer');
      cy.get('button').contains('Play').click();
      
      cy.wait('@apiError');
      
      cy.get('@alertStub').should('have.been.calledWith', 'Failed to start game. Please try again.');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should prevent form submission on Enter key without nickname', () => {
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });

      cy.get('input[placeholder="Nickname..."]').type('{enter}');
      
      cy.get('@alertStub').should('have.been.calledWith', 'Please enter a nickname!');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should handle special characters in nickname', () => {
      const specialNickname = 'Test<>Player&123';
      
      cy.mockApiResponses();
      cy.get('input[placeholder="Nickname..."]').type(specialNickname);
      cy.get('button').contains('Play').click();
      
      // Should still attempt to start game
      cy.wait('@postUser');
    });

    it('should handle network timeout gracefully', () => {
      cy.intercept('POST', '**/user/', {
        delay: 30000,
        statusCode: 408,
        body: { success: false, error: 'Request Timeout' }
      }).as('timeoutRequest');

      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });

      cy.get('input[placeholder="Nickname..."]').type('TestPlayer');
      cy.get('button').contains('Play').click();
      
      // Should remain on start screen
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('UI/UX Interactions', () => {
    it('should have responsive button hover states', () => {
      cy.get('button').contains('Play')
        .should('have.css', 'background-color')
        .and('match', /rgb/);
    });

    it('should clear input field when typing', () => {
      cy.get('input[placeholder="Nickname..."]')
        .type('First')
        .clear()
        .type('Second')
        .should('have.value', 'Second');
    });
  });
});
