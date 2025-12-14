// ***********************************************
// Custom Commands for Bureaucracy Simulator E2E Tests
// ***********************************************

// Basic Auth credentials (matching backend .env)
const AUTH_USERNAME = 'admin';
const AUTH_PASSWORD = 'supersecret';
const AUTH_HEADER = 'Basic ' + btoa(`${AUTH_USERNAME}:${AUTH_PASSWORD}`);

// Command: Start a new game with a nickname
Cypress.Commands.add('startGame', (nickname = 'TestPlayer') => {
  cy.visit('/');
  cy.get('input[placeholder="Nickname..."]').type(nickname);
  cy.get('button').contains('Play').click();
});

// Command: Mock API responses
Cypress.Commands.add('mockApiResponses', () => {
  cy.intercept('GET', '**/startscreen/', (req) => {
    req.headers['authorization'] = AUTH_HEADER;
    req.reply({
      statusCode: 200,
      body: {
        success: true,
        data: {
          songlist: ['song1.mp3', 'song2.mp3']
        }
      }
    });
  }).as('getStartscreen');

  cy.intercept('POST', '**/user/', (req) => {
    req.headers['authorization'] = AUTH_HEADER;
    req.reply({
      statusCode: 200,
      body: {
        success: true,
        data: {
          toDoList: [
            { id: 1, title: 'Task 1', completed: false, type: 'captcha' },
            { id: 2, title: 'Task 2', completed: false, type: 'form' }
          ],
          chatbotMessages: [
            { text: 'Welcome to the game!' },
            { text: 'Complete all tasks to win.' }
          ]
        }
      }
    });
  }).as('postUser');
});

// Command: Mock leaderboard data
Cypress.Commands.add('mockLeaderboard', (entries = []) => {
  const defaultEntries = [
    { name: 'Player1', score: '105' },
    { name: 'Player2', score: '369' },
    { name: 'Player3', score: '' }
  ];
  
  const leaderboardData = entries.length > 0 ? entries : defaultEntries;
  
  // Sort entries by score (numeric, ascending - lower is better)
  const sortedData = [...leaderboardData].sort((a, b) => {
    const scoreA = a.score === '' ? Infinity : parseInt(a.score, 10);
    const scoreB = b.score === '' ? Infinity : parseInt(b.score, 10);
    return scoreA - scoreB;
  });
  
  cy.intercept('GET', '**/leaderboard/', (req) => {
    req.headers['authorization'] = AUTH_HEADER;
    req.reply({
      statusCode: 200,
      body: {
        success: true,
        data: {
          leaderboard: sortedData
        }
      }
    });
  }).as('getLeaderboard');
});

// Command: Mock about us data
Cypress.Commands.add('mockAboutUs', (paragraph = 'Test about us content') => {
  cy.intercept('GET', '**/about-us/', (req) => {
    req.headers['authorization'] = AUTH_HEADER;
    req.reply({
      statusCode: 200,
      body: {
        success: true,
        data: {
          paragraph
        }
      }
    });
  }).as('getAboutUs');
});

// Command: Mock endscreen data
Cypress.Commands.add('mockEndscreen', (percentile = 75, elapsedTime = null) => {
  cy.intercept('POST', '**/endscreen/**', (req) => {
    req.headers['authorization'] = AUTH_HEADER;
    req.reply({
      statusCode: 200,
      body: {
        success: true,
        data: {
          elapsedTime,
          percentile
        }
      }
    });
  }).as('postEndscreen');
});

// Command: Mock API error
Cypress.Commands.add('mockApiError', (endpoint, method = 'GET') => {
  cy.intercept(method, endpoint, (req) => {
    req.headers['authorization'] = AUTH_HEADER;
    req.reply({
      statusCode: 500,
      body: {
        success: false,
        error: 'Internal Server Error',
        message: 'Something went wrong'
      }
    });
  }).as('apiError');
});

// Command: Navigate and wait for load
Cypress.Commands.add('visitAndWait', (path, waitAlias = null) => {
  cy.visit(path);
  if (waitAlias) {
    cy.wait(waitAlias);
  }
  cy.url().should('include', path);
});

// Command: Check if element is visible and contains text
Cypress.Commands.add('shouldBeVisibleWithText', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should('be.visible').and('contain', text);
});

// Command: Setup game context (for tests that need game state)
Cypress.Commands.add('setupGameContext', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('gameContext', JSON.stringify({
      nickname: 'TestPlayer',
      tasks: [
        { id: 1, title: 'Task 1', completed: false },
        { id: 2, title: 'Task 2', completed: false }
      ],
      elapsedTime: 60000,
      isTimerRunning: true
    }));
  });
});