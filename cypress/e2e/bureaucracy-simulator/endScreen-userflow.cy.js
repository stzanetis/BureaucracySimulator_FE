describe('EndScreen - E2E Tests', () => {
 
  describe('Happy User Flow', () => {
    it('should display end screen after game completion', () => {
      cy.mockEndscreen(75, 150);
      
      cy.visit('/end');
      
      // Wait for loading to complete
      cy.contains('Calculating results', { timeout: 1000 }).should('be.visible');
      cy.wait('@postEndscreen');
      
      // Check congratulations message
      cy.contains('Congratulations').should('be.visible');
      cy.contains('you made it!').should('be.visible');

      // Check logo visibility
      cy.get('img[alt="Bureaucracy Simulator"]').should('be.visible');

      // Check formatted score
      cy.contains('150').should('be.visible'); 

      // Check percentile
      cy.contains('top').should('be.visible');
      cy.contains('25%').should('be.visible');
    });

    it('should calculate and display top percentage correctly', () => {
      cy.mockEndscreen(33, 385);
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // 100 - 33 = 67% (top 67%)
      cy.contains('top').should('be.visible');
      cy.contains('67%').should('be.visible');
    });

    it('should handle 100th percentile', () => {
      cy.mockEndscreen(100, 150);

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // 100 - 100 = 0% (top 0%)
      cy.contains('0%').should('be.visible');
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

    it('should handle network timeout', () => {
      cy.intercept('POST', '**/endscreen/**', {
        delay: 5000,
        forceNetworkError: true
      }).as('timeoutRequest');

      cy.visit('/end');
      
      // Should show loading state then fallback
      cy.contains('Calculating results', { timeout: 1000 }).should('be.visible');
    });
  });
});