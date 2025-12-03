describe('LeaderboardScreen - E2E Tests', () => {
  describe('Happy Paths', () => {
    it('should display leaderboard with entries', () => {
      cy.mockLeaderboard([
        { name: 'Player1', score: '10.25' },
        { name: 'Player2', score: '12.50' },
        { name: 'Player3', score: '15.75' }
      ]);

      cy.visit('/leaderboard');
      cy.wait('@getLeaderboard');
      
      cy.contains('Leaderboard').should('be.visible');
      cy.contains('Player1').should('be.visible');
      cy.contains('10.25').should('be.visible');
    });

    it('should display entries with correct ranking', () => {
      cy.mockLeaderboard([
        { name: 'TopPlayer', score: '8.00' },
        { name: 'SecondPlace', score: '10.50' },
        { name: 'ThirdPlace', score: '12.75' }
      ]);

      cy.visit('/leaderboard');
      cy.wait('@getLeaderboard');
      
      // Check rankings
      cy.contains('1. TopPlayer').should('be.visible');
      cy.contains('2. SecondPlace').should('be.visible');
      cy.contains('3. ThirdPlace').should('be.visible');
    });

    it('should display all leaderboard entries in order', () => {
      const entries = Array.from({ length: 9 }, (_, i) => ({
        name: `Player${i + 1}`,
        score: `${10 + i}.00`
      }));
      
      cy.mockLeaderboard(entries);
      cy.visit('/leaderboard');
      cy.wait('@getLeaderboard');
      
      // Check first and last entry
      cy.contains('1. Player1').should('be.visible');
      cy.contains('9. Player9').should('be.visible');
    });

    it('should navigate back when clicking Go Back button', () => {
      cy.mockLeaderboard();
      cy.visit('/');
      
      // Navigate to leaderboard from start screen
      cy.get('button').filter(':has(svg)').eq(0).click();
      cy.url().should('include', '/leaderboard');
      
      cy.contains('Go Back').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should display scores with proper formatting', () => {
      cy.mockLeaderboard([
        { name: 'Player1', score: '10.25' }
      ]);

      cy.visit('/leaderboard');
      cy.wait('@getLeaderboard');
      
      // Check score is displayed as a number
      cy.contains('10.25')
        .should('be.visible')
        .and('have.class', 'text-[#003476]')
        .and('have.class', 'font-bold');
    });

    it('should display player names correctly', () => {
      cy.mockLeaderboard([
        { name: 'TestPlayer123', score: '10.00' }
      ]);

      cy.visit('/leaderboard');
      cy.wait('@getLeaderboard');
      
      cy.contains('TestPlayer123')
        .should('be.visible')
        .and('have.class', 'font-semibold');
    });

    it('should have proper styling and layout', () => {
      cy.mockLeaderboard();
      cy.visit('/leaderboard');
      cy.wait('@getLeaderboard');
      
      // Check container styling
      cy.get('.bg-\\[\\#c7ddf2\\]').should('exist');
      cy.get('.rounded-3xl').should('exist');
    });
  });

  describe('Unhappy Paths', () => {
    it('should show loading state initially', () => {
      // Delay the API response
      cy.intercept('GET', '**/leaderboard/', (req) => {
        req.reply((res) => {
          res.delay = 1000;
          res.send({
            statusCode: 200,
            body: {
              success: true,
              data: { leaderboard: [] }
            }
          });
        });
      }).as('delayedLeaderboard');

      cy.visit('/leaderboard');
      
      cy.contains('Loading...').should('be.visible');
      cy.wait('@delayedLeaderboard');
    });

    it('should handle API error gracefully', () => {
      cy.mockApiError('**/leaderboard/', 'GET');

      cy.visit('/leaderboard');
      cy.wait('@apiError');
      
      // Should display empty state
      cy.contains('No entries yet!').should('be.visible');
    });

    it('should handle malformed data', () => {
      cy.intercept('GET', '**/leaderboard/', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            leaderboard: null
          }
        }
      }).as('malformedData');

      cy.visit('/leaderboard');
      cy.wait('@malformedData');
      
      cy.contains('No entries yet!').should('be.visible');
    });

    it('should handle missing score field', () => {
      cy.intercept('GET', '**/leaderboard/', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            leaderboard: [
              { name: 'Player1' },
              { name: 'Player2', score: '10.00' }
            ]
          }
        }
      }).as('missingScore');

      cy.visit('/leaderboard');
      cy.wait('@missingScore');
      
      // Should still display what it can
      cy.contains('Player1').should('be.visible');
      cy.contains('Player2').should('be.visible');
    });

    it('should handle missing name field', () => {
      cy.intercept('GET', '**/leaderboard/', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            leaderboard: [
              { score: '10.00' },
              { name: 'Player2', score: '12.00' }
            ]
          }
        }
      }).as('missingName');

      cy.visit('/leaderboard');
      cy.wait('@missingName');
      
      // Should still render without crashing
      cy.contains('Leaderboard').should('be.visible');
    });

    it('should display only top 9 entries even if 100 are sent', () => {
      const manyEntries = Array.from({ length: 100 }, (_, i) => ({
        name: `Player${i + 1}`,
        score: `${10 + (i * 0.5)}.00`
      }));
      
      cy.mockLeaderboard(manyEntries);
      
      const startTime = Date.now();
      cy.visit('/leaderboard');
      cy.wait('@getLeaderboard');
      
      cy.contains('Leaderboard').should('be.visible');
      
      // Should only display first 10 entries
      cy.contains('1. Player1').should('be.visible');
      cy.contains('9. Player9').should('be.visible');
      cy.contains('10. Player10').should('not.exist');
      cy.contains('Player100').should('not.exist');
      
      // Should load within reasonable time
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000);
      });
    });

    it('should handle network timeout', () => {
      cy.intercept('GET', '**/leaderboard/', {
        delay: 30000,
        statusCode: 408
      }).as('timeoutRequest');

      cy.visit('/leaderboard');
      
      // Should show loading state
      cy.contains('Loading...').should('be.visible');
    });
  });
});
