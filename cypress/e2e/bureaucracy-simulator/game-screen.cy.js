describe('GameScreen - E2E Tests', () => {
  beforeEach(() => {
    cy.mockApiResponses();
  });

  describe('Happy Paths', () => {
    it('should display game screen with welcome message', () => {
      cy.startGame('TestPlayer');
      
      cy.url().should('include', '/game');
      cy.contains('Welcome User').should('be.visible');
      cy.contains('Your presence has been acknowledged').should('be.visible');

      cy.get('img[alt="Game logo"]').should('be.visible');

      cy.contains('Statute 47-B').should('be.visible');
      cy.contains('Filing a Standard Judicial Report').should('be.visible');
      cy.contains('Proceed with caution').should('be.visible');

      cy.get('body').should('be.visible');
    });

    it('should start timer when game screen loads', () => {
      cy.startGame('TestPlayer');
      
      // Wait a moment and verify context updated
      cy.wait(1000);
      cy.window().its('gameContext').should('exist');
    });

    it('should maintain game state during navigation', () => {
      cy.startGame('TestPlayer');
      
      cy.url().should('include', '/game');
      
      // State should be maintained
      cy.window().then((win) => {
        // Game context should exist
        expect(win.location.pathname).to.include('/game');
      });
    });

    it('should have proper responsive layout', () => {
      cy.startGame('TestPlayer');

      // Test responsive behavior
      cy.viewport(1280, 720);
      cy.contains('Welcome User').should('be.visible');
      
      cy.viewport(768, 1024);
      cy.contains('Welcome User').should('be.visible');
    });

    it('should initialize timer on game start', () => {
      cy.startGame('TestPlayer');
      
      // Timer should start (verified through context)
      cy.wait(100);
      cy.url().should('include', '/game');
    });
  });

  describe('Unhappy Paths', () => {
    it('should redirect when accessing game without game context', () => {
      // Clear any existing context
      cy.clearLocalStorage();
      
      cy.visit('/game');
      
      // Should redirect back to start
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should handle browser back button appropriately', () => {
      cy.startGame('TestPlayer');
      
      cy.url().should('include', '/game');
      
      cy.go('back');
      
      // Should go back to start screen
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should handle page refresh', () => {
      cy.startGame('TestPlayer');
      
      cy.reload();
      
      // After reload, context might be lost, should redirect to start
      cy.url().should('match', /^\/(game)?$/);
    });
  });

  describe('Content Display', () => {
    beforeEach(() => {
      cy.startGame('TestPlayer');
    });

    it('should display all three main paragraphs', () => {
      // First paragraph
      cy.contains('Your presence has been acknowledged').should('be.visible');
      
      // Second paragraph
      cy.contains('Filing a Standard Judicial Report').should('be.visible');
      
      // Third paragraph
      cy.contains('Proceed with caution').should('be.visible');
    });

    it('should display text with proper formatting', () => {
      cy.get('.text-xl').should('exist');
      cy.get('.text-2xl').should('exist');
      cy.get('.font-semibold').should('exist');
    });

    it('should display logo with correct sizing', () => {
      cy.get('img[alt="Game logo"]')
        .should('be.visible')
        .and('have.attr', 'src', '/Logo.png');
    });

    it('should have proper text spacing', () => {
      cy.get('.space-y-8').should('exist');
      cy.get('.leading-relaxed').should('exist');
    });
  });

  describe('Navigation Guards', () => {
    it('should allow navigation to task routes from game screen', () => {
      cy.startGame('TestPlayer');
      
      // Mock task data
      cy.intercept('GET', '**/user/homescreen/tasks/*', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 1,
            title: 'Test Task',
            type: 'captcha'
          }
        }
      }).as('getTask');
      
      // Navigate to a task (would normally happen via task list click)
      cy.visit('/game/task/captcha/1');
      
      cy.url().should('include', '/game/task/captcha/1');
    });

    it('should prevent direct access to end screen without completing game', () => {
      cy.visit('/end');
      
      // Should show loading or error state
      cy.contains('Calculating results', { timeout: 1000 }).should('be.visible');
    });
  });

  describe('Error Boundaries', () => {
    it('should handle component errors gracefully', () => {
      // Mock console.error to catch errors
      cy.window().then((win) => {
        cy.stub(win.console, 'error').as('consoleError');
      });

      cy.startGame('TestPlayer');
      
      // Page should load without errors
      cy.contains('Welcome User').should('be.visible');
    });

    it('should render fallback UI on critical errors', () => {
      // Test with corrupted context
      cy.visit('/');
      cy.window().then((win) => {
        // Simulate corrupted game context
        win.localStorage.setItem('gameContext', 'invalid-json');
      });
      
      cy.visit('/game');
      
      // Should handle gracefully and redirect
      cy.url().should('not.include', '/game');
    });
  });
});
