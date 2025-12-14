describe('Start Screen Tests', () => {
  beforeEach(() => {
    cy.mockApiResponses();
    cy.visit('/');
  });

  //Check that Start Screen displays UI correctly
  it('should display the start screen with all elements', () => {
    // Check logo is visible
    cy.get('img[alt="Bureaucracy Simulator"]').should('be.visible');
    
    // Check nickname input exists
    cy.get('input[placeholder="Nickname..."]').should('be.visible');
    
    // Check Play button exists
    cy.get('button').contains('Play').should('be.visible');
    
    // Check navigation buttons exist
    cy.get('button').should('have.length.at.least', 4); // Play + 3 icon buttons

    //Check button hover effects
    cy.get('button').contains('Play')
      .should('have.css', 'background-color')
      .and('match', /rgb/);
  });

  it('should navigate to leaderboard when clicking star button', () => {
    cy.mockLeaderboard();
    
    // Find and click the star button (first icon button at bottom)
    cy.get('button').filter(':has(svg)').eq(0).click();
    cy.url().should('include', '/leaderboard');
  });

  describe('Leaderboard', () => {
    describe('Happy Paths', () => {

      it('should have proper styling and layout', () => {
      cy.mockLeaderboard([{ name: 'TestPlayer123', score: '133' }]);
      cy.visit('/leaderboard');
      cy.wait('@getLeaderboard');
      
      //Check entry styling
      cy.contains('TestPlayer123')
        .should('be.visible')
        .and('have.class', 'font-semibold');
      
      // Check container styling
      cy.get('.bg-\\[\\#c7ddf2\\]').should('exist');
      cy.get('.rounded-3xl').should('exist');
      });

      it('should display up to 9 leaderboard with entries correctly and in order', () => {
        const entries = Array.from({ length: 10 }, (_, i) => ({
          name: `Player${i + 1}`,
          score: `${100 - i}`
        }));
      cy.mockLeaderboard(entries);

      cy.visit('/leaderboard');
      cy.wait('@getLeaderboard');
      
      cy.contains('Leaderboard').should('be.visible');
      // Check first and last entries
      cy.contains('1. Player10').should('be.visible');
      cy.contains('91').should('be.visible');
      cy.contains('2. Player9').should('be.visible');
      cy.contains('92').should('be.visible');
      cy.contains('10. Player1').should('be.not.exist');
      cy.contains('100').should('be.not.exist');
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
    });

    describe('Unhappy Paths', () => {

      it('should handle network timeout', () => {
        cy.intercept('GET', '**/leaderboard/', {
          delay: 30000,
          statusCode: 408
        }).as('timeoutRequest');

        cy.visit('/leaderboard');
        
        // Should show loading state
        cy.contains('Loading...').should('be.visible');
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
    });
  });

  it('should navigate to credits when clicking user button', () => {
        cy.mockAboutUs();
        
        // Find and click the user/credits button (second icon button at bottom)
        cy.get('button').filter(':has(svg)').eq(1).click();
        cy.url().should('include', '/credits');
      });

  describe('Credits', () => {
    describe('Happy Paths', () => {
      
      it('should display credits/about us screen', () => {
        cy.mockAboutUs('Welcome to our amazing Bureaucracy Simulator game!');
        
        cy.visit('/credits');
        cy.wait('@getAboutUs');
        
        cy.contains('About Us').should('be.visible');
        cy.contains('Welcome to our amazing Bureaucracy Simulator game!').should('be.visible');
      });

      it('should have proper title styling', () => {
        cy.mockAboutUs();
        
        cy.visit('/credits');
        cy.wait('@getAboutUs');
        
        cy.get('h1')
          .contains('About Us')
          .should('have.class', 'text-4xl')
          .and('have.class', 'font-bold');
      });

      it('should be able to display long content', () => {
        const longText = 'Lorem ipsum dolor sit amet, '.repeat(40);
        cy.mockAboutUs(longText);
        
        cy.visit('/credits');
        cy.wait('@getAboutUs');
        
        cy.contains('Lorem ipsum').should('be.visible');
      });

      it('should navigate back to start screen when clicking Go Back', () => {
        cy.mockAboutUs();
        
        cy.visit('/credits');
        cy.wait('@getAboutUs');
        
        cy.contains('Go Back').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/');
      });

    });

    describe('Unhappy Paths', () => {
    
      it('should handle network timeout', () => {
        cy.intercept('GET', '**/about-us/', {
          delay: 30000,
          statusCode: 408
        }).as('timeoutRequest');

        cy.visit('/credits');
        
        cy.contains('Loading...').should('be.visible');
      });

      it('should handle malformed response', () => {
        cy.intercept('GET', '**/about-us/', {
          statusCode: 200,
          body: 'invalid json'
        }).as('malformedResponse');

        cy.visit('/credits');
        
        // Should handle error and display default fallback
        cy.contains('About Us').should('be.visible');
        cy.contains('Welcome to Bureaucracy Simulator!').should('be.visible');
      });

      it('should handle special/unicode characters', () => {
        cy.mockAboutUs('Test & © ® ™ <>  你好 مرحبا Привет 🎮 "quotes" \'apostrophes\'');
        
        cy.visit('/credits');
        cy.wait('@getAboutUs');
        
        cy.contains('Test').should('be.visible');
      });
    });
  });

  describe('Start Game', () => {
    describe('Happy Paths', () => {

      it('should clear input field when typing', () => {
        cy.get('input[placeholder="Nickname..."]')
          .type('First')
          .clear()
          .type('Second')
          .should('have.value', 'Second');
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

      it('should respect 20 character nickname limit', () => {
        const longNickname = 'ThisIsAVeryLongNickname123456';
        const expectedNickname = longNickname.substring(0, 20);
        
        cy.get('input[placeholder="Nickname..."]')
          .type(longNickname)
          .should('have.value', expectedNickname);
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
  });
});