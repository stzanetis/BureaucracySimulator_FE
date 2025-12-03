describe('Full User Journey - E2E Tests', () => {
  beforeEach(() => {
    // Mock all API endpoints for complete journey
    cy.mockApiResponses();
    cy.mockLeaderboard();
    cy.mockAboutUs();
    cy.mockEndscreen(85);
  });

  describe('Complete Game Flow', () => {
    it('should complete full game journey from start to end', () => {
      // 1. Start Screen - Enter nickname and start game
      cy.visit('/');
      cy.contains('Bureaucracy Simulator').should('be.visible');
      
      const playerNickname = 'TestPlayer123';
      cy.get('input[placeholder="Nickname..."]').type(playerNickname);
      cy.get('button').contains('Play').click();
      
      cy.wait('@postUser');
      
      // 2. Game Screen - Verify game started
      cy.url().should('include', '/game');
      cy.contains('Welcome User').should('be.visible');
      cy.contains('Statute 47-B').should('be.visible');
      
      // 3. Simulate completing game (navigate to end screen)
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: playerNickname,
          tasks: [],
          elapsedTime: 180000,
          isTimerRunning: false
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // 4. End Screen - Check results
      cy.contains('Congratulations').should('be.visible');
      cy.contains('you made it!').should('be.visible');
      cy.contains('3.00').should('be.visible'); // 180000ms = 3 minutes
      
      // 5. View Leaderboard
      cy.contains('View the Leaderboard').click();
      cy.wait('@getLeaderboard');
      cy.url().should('include', '/leaderboard');
      cy.contains('Leaderboard').should('be.visible');
      
      // 6. Return to start
      cy.contains('Go Back').click();
      cy.url().should('include', '/end');
      
      cy.contains('Play Again').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should navigate through all screens before starting game', () => {
      cy.visit('/');
      
      // Navigate to Credits
      cy.get('button').filter(':has(svg)').eq(1).click();
      cy.wait('@getAboutUs');
      cy.url().should('include', '/credits');
      cy.contains('About Us').should('be.visible');
      
      // Go back to start
      cy.contains('Go Back').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Navigate to Leaderboard
      cy.get('button').filter(':has(svg)').eq(0).click();
      cy.wait('@getLeaderboard');
      cy.url().should('include', '/leaderboard');
      cy.contains('Leaderboard').should('be.visible');
      
      // Go back and start game
      cy.contains('Go Back').click();
      cy.startGame('Explorer');
      cy.url().should('include', '/game');
    });

    it('should handle complete workflow with error recovery', () => {
      cy.visit('/');
      
      // Try to start without nickname (error case)
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });
      cy.get('button').contains('Play').click();
      cy.get('@alertStub').should('have.been.calledWith', 'Please enter a nickname!');
      
      // Correct the error and start game
      cy.startGame('RecoveredPlayer');
      cy.url().should('include', '/game');
      
      // Complete journey
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'RecoveredPlayer',
          elapsedTime: 120000
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      cy.contains('Congratulations').should('be.visible');
    });
  });

  describe('Navigation Flows', () => {
    it('should support browser back/forward navigation throughout journey', () => {
      cy.visit('/');
      cy.startGame('Navigator');
      cy.url().should('include', '/game');
      
      // Go back
      cy.go('back');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Go forward
      cy.go('forward');
      cy.url().should('include', '/game');
    });

    it('should maintain proper state during complex navigation', () => {
      cy.visit('/');
      
      // Navigate to leaderboard
      cy.get('button').filter(':has(svg)').eq(0).click();
      cy.wait('@getLeaderboard');
      
      // Use browser back
      cy.go('back');
      
      // Navigate to credits
      cy.get('button').filter(':has(svg)').eq(1).click();
      cy.wait('@getAboutUs');
      
      // Use browser back
      cy.go('back');
      
      // Start game
      cy.startGame('ComplexNavigator');
      cy.url().should('include', '/game');
    });

    it('should handle deep linking to various screens', () => {
      // Direct navigation to leaderboard
      cy.mockLeaderboard();
      cy.visit('/leaderboard');
      cy.contains('Leaderboard').should('be.visible');
      
      // Direct navigation to credits
      cy.mockAboutUs();
      cy.visit('/credits');
      cy.contains('About Us').should('be.visible');
      
      // Return to start via button
      cy.contains('Go Back').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Multiple Game Sessions', () => {
    it('should support playing multiple times in succession', () => {
      // First game
      cy.startGame('Player1');
      cy.url().should('include', '/game');
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'Player1',
          elapsedTime: 150000
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      cy.contains('Play Again').click();
      
      // Second game
      cy.startGame('Player2');
      cy.url().should('include', '/game');
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'Player2',
          elapsedTime: 200000
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      cy.contains('Congratulations').should('be.visible');
    });

    it('should reset state properly between games', () => {
      // First game
      cy.startGame('FirstPlayer');
      cy.url().should('include', '/game');
      
      // Complete and restart
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'FirstPlayer',
          elapsedTime: 100000
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      cy.contains('Play Again').click();
      
      // Verify clean state
      cy.get('input[placeholder="Nickname..."]').should('have.value', '');
      
      // Second game with different nickname
      cy.startGame('SecondPlayer');
      cy.url().should('include', '/game');
    });
  });

  describe('Error Handling Throughout Journey', () => {
    it('should handle API failures gracefully at each step', () => {
      cy.visit('/');
      
      // Test with API error on start
      cy.mockApiError('**/user/', 'POST');
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });
      
      cy.get('input[placeholder="Nickname..."]').type('ErrorTest');
      cy.get('button').contains('Play').click();
      cy.wait('@apiError');
      
      cy.get('@alertStub').should('have.been.called');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should handle network issues during leaderboard fetch', () => {
      cy.mockApiError('**/leaderboard/', 'GET');
      
      cy.visit('/leaderboard');
      cy.wait('@apiError');
      
      // Should show empty state
      cy.contains('No entries yet!').should('be.visible');
      
      // Can still navigate back
      cy.contains('Go Back').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should recover from end screen API errors', () => {
      cy.mockApiError('**/endscreen/**', 'POST');
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'ErrorPlayer',
          elapsedTime: 150000
        }));
      });
      
      cy.visit('/end');
      cy.wait('@apiError');
      
      // Should show with default percentile
      cy.contains('50%').should('be.visible');
      
      // Can still navigate
      cy.contains('Play Again').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('User Experience Flows', () => {
    it('should provide smooth experience for first-time user', () => {
      // User arrives at start screen
      cy.visit('/');
      cy.get('img[alt="Bureaucracy Simulator"]').should('be.visible');
      
      // User checks leaderboard before playing
      cy.get('button').filter(':has(svg)').eq(0).click();
      cy.wait('@getLeaderboard');
      cy.contains('Leaderboard').should('be.visible');
      cy.contains('Go Back').click();
      
      // User checks credits
      cy.get('button').filter(':has(svg)').eq(1).click();
      cy.wait('@getAboutUs');
      cy.contains('About Us').should('be.visible');
      cy.contains('Go Back').click();
      
      // User starts game
      cy.startGame('FirstTimeUser');
      cy.url().should('include', '/game');
      
      // User completes game
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'FirstTimeUser',
          elapsedTime: 180000
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // User checks final leaderboard position
      cy.contains('View the Leaderboard').click();
      cy.wait('@getLeaderboard');
      cy.contains('Leaderboard').should('be.visible');
    });

    it('should handle competitive player checking leaderboard multiple times', () => {
      cy.visit('/');
      
      // Check leaderboard before game
      cy.get('button').filter(':has(svg)').eq(0).click();
      cy.wait('@getLeaderboard');
      cy.contains('Go Back').click();
      
      // Start game
      cy.startGame('CompetitivePlayer');
      cy.url().should('include', '/game');
      
      // Complete game
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'CompetitivePlayer',
          elapsedTime: 90000
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // Check leaderboard from end screen
      cy.contains('View the Leaderboard').click();
      cy.wait('@getLeaderboard');
      
      // Go back to end screen
      cy.contains('Go Back').click();
      cy.url().should('include', '/end');
      
      // Check leaderboard again
      cy.contains('View the Leaderboard').click();
      cy.wait('@getLeaderboard');
    });

    it('should support quick replay flow', () => {
      // Fast game completion
      cy.startGame('SpeedRunner');
      cy.url().should('include', '/game');
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'SpeedRunner',
          elapsedTime: 60000
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      // Immediate replay
      cy.contains('Play Again').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Second attempt
      cy.startGame('SpeedRunner2');
      cy.url().should('include', '/game');
    });
  });

  describe('Data Persistence and State Management', () => {
    it('should maintain game context throughout journey', () => {
      const nickname = 'PersistentPlayer';
      
      cy.startGame(nickname);
      cy.url().should('include', '/game');
      
      // Verify context is set
      cy.window().its('localStorage').invoke('getItem', 'gameContext')
        .should('exist');
    });

    it('should clear state appropriately on reset', () => {
      cy.startGame('TemporaryPlayer');
      
      cy.window().then((win) => {
        win.localStorage.setItem('gameContext', JSON.stringify({
          nickname: 'TemporaryPlayer',
          elapsedTime: 120000
        }));
      });
      
      cy.visit('/end');
      cy.wait('@postEndscreen');
      
      cy.contains('Play Again').click();
      
      // State should be reset for new game
      cy.get('input[placeholder="Nickname..."]').should('have.value', '');
    });
  });

  describe('Performance and Load Times', () => {
    it('should load all screens within acceptable time', () => {
      const screens = ['/', '/leaderboard', '/credits'];
      
      screens.forEach(screen => {
        const startTime = Date.now();
        cy.visit(screen);
        
        cy.get('body').should('be.visible');
        
        cy.then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(3000);
        });
      });
    });

    it('should handle rapid screen transitions', () => {
      cy.visit('/');
      cy.get('button').filter(':has(svg)').eq(0).click();
      cy.wait('@getLeaderboard');
      
      cy.contains('Go Back').click();
      cy.get('button').filter(':has(svg)').eq(1).click();
      cy.wait('@getAboutUs');
      
      cy.contains('Go Back').click();
      cy.get('button').filter(':has(svg)').eq(0).click();
      cy.wait('@getLeaderboard');
      
      // Should handle without errors
      cy.contains('Leaderboard').should('be.visible');
    });
  });

  describe('Accessibility Throughout Journey', () => {
    it('should support keyboard navigation through entire flow', () => {
      cy.visit('/');
      
      // Tab to nickname input
      cy.get('input[placeholder="Nickname..."]').focus().type('KeyboardUser');
      
      // Tab to Play button and press Enter
      cy.get('button').contains('Play').focus().type('{enter}');
      cy.wait('@postUser');
      
      cy.url().should('include', '/game');
    });

    it('should maintain focus management across screens', () => {
      cy.visit('/');
      
      cy.get('button').filter(':has(svg)').eq(0).focus().type('{enter}');
      cy.wait('@getLeaderboard');
      cy.url().should('include', '/leaderboard');
      
      cy.contains('Go Back').focus().type('{enter}');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });
});
