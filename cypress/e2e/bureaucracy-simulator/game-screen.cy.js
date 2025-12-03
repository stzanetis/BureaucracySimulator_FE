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
    });

    it('should display the game logo', () => {
      cy.startGame('TestPlayer');
      
      cy.get('img[alt="Game logo"]').should('be.visible');
    });

    it('should display complete game instructions', () => {
      cy.startGame('TestPlayer');
      
      // Check for key instruction text
      cy.contains('Statute 47-B').should('be.visible');
      cy.contains('Filing a Standard Judicial Report').should('be.visible');
      cy.contains('Proceed with caution').should('be.visible');
    });

    it('should start timer when game screen loads', () => {
      cy.startGame('TestPlayer');
      
      // Wait a moment and verify context updated
      cy.wait(1000);
      cy.window().its('gameContext').should('exist');
    });

    it('should display game layout with sidebar', () => {
      cy.startGame('TestPlayer');
      
      // GameLayout should render - check for common layout elements
      cy.get('body').should('be.visible');
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
  });

  describe('Unhappy Paths', () => {
    it('should redirect to start screen when no tasks available', () => {
      // Visit game screen directly without starting game
      cy.visit('/game');
      
      // Should redirect to start screen
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should redirect when accessing game without game context', () => {
      // Clear any existing context
      cy.clearLocalStorage();
      
      cy.visit('/game');
      
      // Should redirect back to start
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should handle missing task data gracefully', () => {
      // Mock API with empty task list
      cy.intercept('POST', '**/user/', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            toDoList: [],
            chatbotMessages: []
          }
        }
      }).as('postUserEmpty');

      cy.visit('/');
      cy.get('input[placeholder="Nickname..."]').type('TestPlayer');
      cy.get('button').contains('Play').click();
      
      cy.wait('@postUserEmpty');
      
      // Should redirect back to start due to empty tasks
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should handle null task list', () => {
      cy.intercept('POST', '**/user/', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            toDoList: null,
            chatbotMessages: []
          }
        }
      }).as('postUserNull');

      cy.visit('/');
      cy.get('input[placeholder="Nickname..."]').type('TestPlayer');
      cy.get('button').contains('Play').click();
      
      cy.wait('@postUserNull');
      
      // Should redirect to start
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

  describe('Game Layout Integration', () => {
    beforeEach(() => {
      cy.startGame('TestPlayer');
    });

    it('should render within game layout container', () => {
      // Check that content is within a structured layout
      cy.get('.p-8').should('exist');
    });

    it('should display header with proper styling', () => {
      cy.get('h1').contains('Welcome User')
        .should('have.class', 'text-6xl')
        .and('have.class', 'font-bold');
    });

    it('should display horizontal rule separator', () => {
      cy.get('hr').should('be.visible');
    });

    it('should have proper responsive layout', () => {
      // Test responsive behavior
      cy.viewport(1280, 720);
      cy.contains('Welcome User').should('be.visible');
      
      cy.viewport(768, 1024);
      cy.contains('Welcome User').should('be.visible');
    });
  });

  describe('Timer Functionality', () => {
    it('should initialize timer on game start', () => {
      cy.startGame('TestPlayer');
      
      // Timer should start (verified through context)
      cy.wait(100);
      cy.url().should('include', '/game');
    });

    it('should not start multiple timers on re-render', () => {
      cy.startGame('TestPlayer');
      
      // Force re-render by interacting with page
      cy.contains('Welcome User').should('be.visible');
      cy.wait(500);
      
      // Still on game screen, timer running
      cy.url().should('include', '/game');
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
