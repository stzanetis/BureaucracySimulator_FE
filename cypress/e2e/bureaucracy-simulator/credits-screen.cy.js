describe('CreditsScreen - E2E Tests', () => {
  describe('Happy Paths', () => {
    it('should display credits/about us screen', () => {
      cy.mockAboutUs('Welcome to our amazing Bureaucracy Simulator game!');
      
      cy.visit('/credits');
      cy.wait('@getAboutUs');
      
      cy.contains('About Us').should('be.visible');
      cy.contains('Welcome to our amazing Bureaucracy Simulator game!').should('be.visible');
    });

    it('should display about us content', () => {
      const aboutText = 'We are a team of developers passionate about creating unique gaming experiences.';
      cy.mockAboutUs(aboutText);
      
      cy.visit('/credits');
      cy.wait('@getAboutUs');
      
      cy.contains(aboutText).should('be.visible');
    });

    it('should navigate back to start screen when clicking Go Back', () => {
      cy.mockAboutUs();
      
      cy.visit('/credits');
      cy.wait('@getAboutUs');
      
      cy.contains('Go Back').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should display multi-line content correctly', () => {
      const multiLineText = 'Line 1\nLine 2\nLine 3';
      cy.mockAboutUs(multiLineText);
      
      cy.visit('/credits');
      cy.wait('@getAboutUs');
      
      cy.contains('Line 1').should('be.visible');
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

    it('should navigate from start screen icon', () => {
      cy.mockAboutUs();
      
      cy.visit('/');
      
      // Click the user/credits icon button (User icon is second)
      cy.get('button').filter(':has(svg)').eq(1).click();
      
      cy.url().should('include', '/credits');
    });

    it('should display long content with proper scrolling', () => {
      const longText = 'Lorem ipsum dolor sit amet, '.repeat(50);
      cy.mockAboutUs(longText);
      
      cy.visit('/credits');
      cy.wait('@getAboutUs');
      
      cy.contains('Lorem ipsum').should('be.visible');
    });
  });

  describe('Unhappy Paths', () => {
    it('should show loading state initially', () => {
      cy.intercept('GET', '**/about-us/', (req) => {
        req.reply((res) => {
          res.delay = 1000;
          res.send({
            statusCode: 200,
            body: {
              success: true,
              data: { paragraph: 'Test content' }
            }
          });
        });
      }).as('delayedAboutUs');

      cy.visit('/credits');
      
      cy.contains('Loading...').should('be.visible');
      cy.wait('@delayedAboutUs');
    });

    it('should handle API error gracefully', () => {
      cy.mockApiError('**/about-us/', 'GET');
      
      cy.visit('/credits');
      cy.wait('@apiError');
      
      // Should display fallback content
      cy.contains('Welcome to Bureaucracy Simulator!').should('be.visible');
    });

    it('should handle empty about us content', () => {
      cy.mockAboutUs('');
      
      cy.visit('/credits');
      cy.wait('@getAboutUs');
      
      // Should display default fallback
      cy.contains('Welcome to Bureaucracy Simulator!').should('be.visible');
    });

    it('should handle null paragraph', () => {
      cy.intercept('GET', '**/about-us/', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            paragraph: null
          }
        }
      }).as('nullParagraph');

      cy.visit('/credits');
      cy.wait('@nullParagraph');
      
      cy.contains('Welcome to Bureaucracy Simulator!').should('be.visible');
    });

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
      
      // Should handle error and possibly show fallback
      cy.contains('About Us').should('be.visible');
    });

    it('should handle special characters', () => {
      cy.mockAboutUs('Test & © ® ™ <> "quotes" \'apostrophes\'');
      
      cy.visit('/credits');
      cy.wait('@getAboutUs');
      
      cy.contains('Test').should('be.visible');
    });

    it('should handle unicode characters', () => {
      cy.mockAboutUs('Test 你好 مرحبا Привет 🎮');
      
      cy.visit('/credits');
      cy.wait('@getAboutUs');
      
      cy.contains('Test').should('be.visible');
    });
  });
});
