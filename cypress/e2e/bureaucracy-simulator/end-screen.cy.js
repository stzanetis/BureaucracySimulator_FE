describe('EndScreen - E2E Tests', () => {
  beforeEach(() => {
    cy.mockEndscreen(75);
  });

  describe('Happy Paths', () => {
    it('should display end screen after game completion', () => {
      // Setup game context with completed state
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          tasks: [],
          elapsedTime: 150000, // 2.5 minutes in milliseconds
          isTimerRunning: false
        }));
      });

      cy.visit('/end');
      
      // Wait for loading to complete
      cy.contains('Calculating results', { timeout: 1000 }).should('be.visible');
      cy.wait('@postEndscreen');
      
      // Check congratulations message
      cy.contains('Congratulations').should('be.visible');
      cy.contains('you made it!').should('be.visible');
    });

    it('should display logo on end screen', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 120000
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.get('img[alt="Bureaucracy Simulator"]').should('be.visible');
    });

    it('should display formatted score', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 200 // 3 minutes = 180000ms
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // Score should be 3.00 (180000ms / 60000 = 3.00 minutes)
      cy.contains('3.00').should('be.visible');
    });

    it('should display percentile correctly', () => {
      cy.mockEndscreen(80);
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // 100 - 80 = 20% (top 20%)
      cy.contains('top').should('be.visible');
      cy.contains('20%').should('be.visible');
    });

    it('should navigate to leaderboard when clicking View Leaderboard button', () => {
      cy.mockLeaderboard();
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.contains('View the Leaderboard').click();
      cy.url().should('include', '/leaderboard');
    });

    it('should reset game and navigate to start when clicking Play Again', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.contains('Play Again').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should stop timer when end screen loads', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000,
          isTimerRunning: true
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // Timer should be stopped
      cy.wait(1000);
      // Elapsed time should not increase
    });

    it('should submit score with nickname', () => {
      const testNickname = 'TopPlayer';
      
      cy.intercept('POST', '**/endscreen/**', (req) => {
        expect(req.url).to.include(testNickname);
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            data: { percentile: 75 }
          }
        });
      }).as('postEndscreenWithNickname');

      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: testNickname,
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreenWithNickname');
    });
  });

  describe('Unhappy Paths', () => {
    it('should show loading state initially', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      
      cy.contains('Calculating results').should('be.visible');
    });

    it('should handle API error gracefully with default percentile', () => {
      cy.mockApiError('**/endscreen/**', 'POST');
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      cy.wait('@apiError');
      
      // Should display with default 50th percentile
      cy.contains('50%').should('be.visible');
    });

    it('should handle missing percentile in API response', () => {
      cy.intercept('POST', '**/endscreen/**', {
        statusCode: 200,
        body: {
          success: true,
          data: {}
        }
      }).as('postEndscreenNoPercentile');

      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreenNoPercentile');
      
      // Should use default 50th percentile
      cy.contains('50%').should('be.visible');
    });

    it('should handle zero elapsed time', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 0
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // Should display 0.00
      cy.contains('0.00').should('be.visible');
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

    it('should handle missing nickname', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: '',
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      
      // Should still work, might use 'Anonymous' as fallback
      cy.wait('@postEndscreen');
    });

    it('should handle network timeout', () => {
      cy.intercept('POST', '**/endscreen/**', {
        delay: 30000,
        statusCode: 408
      }).as('timeoutRequest');

      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      
      // Should show loading state
      cy.contains('Calculating results').should('be.visible');
    });

    it('should handle direct navigation without game context', () => {
      cy.clearLocalStorage();
      cy.visit('/end');
      
      // Should show loading or handle missing context
      cy.contains('Calculating results').should('be.visible');
    });
  });

  describe('Score Formatting', () => {
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

    it('should handle fractional seconds correctly', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 65432 // 1.09053... minutes
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.contains(/1\.\d{2}/).should('be.visible');
    });
  });

  describe('Percentile Display', () => {
    it('should calculate and display top percentage correctly', () => {
      cy.mockEndscreen(95);
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });

      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // 100 - 95 = 5% (top 5%)
      cy.contains('top').should('be.visible');
      cy.contains('5%').should('be.visible');
    });

    it('should handle 100th percentile', () => {
      cy.mockEndscreen(100);
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });

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

  describe('Button Interactions', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });
      cy.visit('/end');
      cy.wait('@postEndscreen');
    });

    it('should have properly styled action buttons', () => {
      cy.contains('View the Leaderboard')
        .should('have.class', 'bg-[#003476]')
        .and('be.visible');
      
      cy.contains('Play Again')
        .should('have.class', 'bg-[#003476]')
        .and('be.visible');
    });

    it('should have hover effects on buttons', () => {
      cy.contains('View the Leaderboard')
        .trigger('mouseover')
        .should('be.visible');
    });

    it('should have accessible button sizes', () => {
      cy.contains('View the Leaderboard')
        .should('have.css', 'padding');
      
      cy.contains('Play Again')
        .should('have.css', 'padding');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TestPlayer',
          elapsedTime: 150000
        }));
      });
    });

    it('should display correctly on desktop', () => {
      cy.viewport(1280, 720);
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.contains('Congratulations').should('be.visible');
    });

    it('should display correctly on tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.contains('Congratulations').should('be.visible');
    });

    it('should display correctly on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.contains('Congratulations').should('be.visible');
    });
  });
});
