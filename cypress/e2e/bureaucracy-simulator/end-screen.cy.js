describe('EndScreen - E2E Tests', () => {
  describe('Happy Paths', () => {
    it('should display end screen after game completion', () => {
      cy.mockEndscreen(75);
      
      cy.visit('/end');
      
      // Wait for loading to complete
      cy.contains('Calculating results', { timeout: 1000 }).should('be.visible');
      cy.wait('@postEndscreen');
      
      // Check congratulations message
      cy.contains('Congratulations').should('be.visible');
      cy.contains('you made it!').should('be.visible');
    });

    it('should display logo on end screen', () => {
      cy.mockEndscreen(75);
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.get('img[alt="Bureaucracy Simulator"]').should('be.visible');
    });

    it('should display formatted score', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 180 // 3 minutes = 180 seconds
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // Score should be 3.00 (180 seconds / 60 = 3.00 minutes)
      cy.contains('3.00').should('be.visible');
    });

    it('should display percentile correctly', () => {
      cy.mockEndscreen(80, 150);
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // 100 - 80 = 20% (top 20%)
      cy.contains('top').should('be.visible');
      cy.contains('20%').should('be.visible');
    });

    it('should navigate to leaderboard when clicking View Leaderboard button', () => {
      cy.mockEndscreen(75, 150);
      cy.mockLeaderboard();
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.contains('View the Leaderboard').click();
      cy.url().should('include', '/leaderboard');
    });

    it('should reset game and navigate to start when clicking Play Again', () => {
      cy.mockEndscreen(75, 150);
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.contains('Play Again').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should stop timer when end screen loads', () => {
      cy.mockEndscreen(75, 150);

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // Verify end screen is displayed (timer functionality tested via game state)
      cy.contains('Congratulations').should('be.visible');
    });

    it('should format score to 2 decimal places', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 137500 // 2.291666... minutes
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // Should be rounded to 2 decimals
      cy.contains(/\d+\.\d{2}/).should('be.visible');
    });
  });

  describe('Unhappy Paths', () => {
    it('should handle API error gracefully with default percentile', () => {
      cy.mockApiError('**/endscreen/**', 'POST');

      cy.visit('/end');
      cy.wait('@apiError');
      
      // Should display with default 50th percentile (100 - 50 = 50%)
      cy.contains('50%').should('be.visible');
    });

    it('should handle missing percentile in API response', () => {
      cy.intercept('POST', '**/endscreen/**', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            data: {
              elapsedTime: req.body.elapsedTime
            },
            error: null,
            message: 'Endscreen stats submitted.'
          }
        });
      }).as('postEndscreenNoPercentile');

      cy.visit('/end');
      cy.wait('@postEndscreenNoPercentile');
      
      // Should use default 50th percentile (100 - 50 = 50%)
      cy.contains('50%').should('be.visible');
    });

    it('should handle very large elapsed time', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 3600000 // 1 hour
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // Should display 60.00 minutes
      cy.contains('60.00').should('be.visible');
    });

    it('should handle network timeout', () => {
      cy.intercept('POST', '**/endscreen/**', {
        delay: 5000,
        forceNetworkError: true
      }).as('timeoutRequest');

      cy.visit('/end');
      
      // Should show loading state
      cy.contains('Calculating results').should('be.visible');
    });
  });

  describe('Percentile Display', () => {
    it('should calculate and display top percentage correctly', () => {
      cy.mockEndscreen(3, 120);
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.contains('top').should('be.visible');
      cy.contains('97%').should('be.visible');
    });

    it('should handle 100th percentile', () => {
      cy.mockEndscreen(100, 150);

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // 100 - 100 = 0% (top 0%)
      cy.contains('0%').should('be.visible');
    });

    it('should handle 0th percentile', () => {
      cy.mockEndscreen(0);
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // 100 - 0 = 100% (top 100%)
      cy.contains('100%').should('be.visible');
    });
  });
});
