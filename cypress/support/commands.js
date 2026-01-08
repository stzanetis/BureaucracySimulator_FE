// ***********************************************
// Custom Commands for Bureaucracy Simulator E2E Tests
// ***********************************************

// Basic Auth credentials (matching backend .env)
const AUTH_USERNAME = 'admin';
const AUTH_PASSWORD = 'supersecret';
const AUTH_HEADER = 'Basic ' + btoa(`${AUTH_USERNAME}:${AUTH_PASSWORD}`);

import { puzzleAnswerMap } from './puzzleAnswers';

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
            { id: 2, taskType: 'FORM', completed: false, pageName: 'form-task' },
            { id: 3, taskType: 'PUZZLE', completed: false, pageName: 'puzzle-task' },
            { id: 7, taskType: 'DISPLAY', completed: false, pageName: 'display-task' },
            { id: 5, taskType: 'SIGNATURE', completed: false, pageName: 'signature-task' }
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
    // Use the elapsedTime from request body if not provided
    const timeToReturn = elapsedTime !== null ? elapsedTime : req.body.elapsedTime;
    req.reply({
      statusCode: 200,
      body: {
        success: true,
        data: {
          elapsedTime,
          percentile
        },
        error: null,
        message: 'Endscreen stats submitted.'
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

// Complete Form Task
Cypress.Commands.add('fillForm', ({
  fullName,
  idNumber,
  dob,
  purpose,
  address,
  signature
}) => {

  cy.get('input[placeholder="First Middle Last"]')
    .should('be.visible')
    .clear()
    .type(fullName);

  cy.get('input[placeholder="000-000-0000"]')
    .should('be.visible')
    .clear()
    .type(idNumber);

  cy.get('input[type="date"]')
    .should('be.visible')
    .clear()
    .type(dob)

  cy.get('select')
    .should('be.visible')
    .select(purpose);

  cy.get('input[placeholder="Street, City, State, ZIP"]')
    .should('be.visible')
    .clear()
    .type(address);

  cy.get('textarea[placeholder="Your signature"]')
    .should('be.visible')
    .clear()
    .type(signature);
});

// Complete Display Task
Cypress.Commands.add('completeDisplayTask', () => {
  cy.get('body').click();

  cy.get('body').type('====', { force: true });

  cy.contains('Complete Audit')
    .should('be.enabled')
    .click();
});

// Complete Signature Task
Cypress.Commands.add('completeCoffeTask', () => {
  // Prevent external tabs (Buy Me a Coffee)
  cy.window().then((win) => {
    cy.stub(win, 'open').as('windowOpen')
  })

  // Take a number
  cy.get('img[alt="Take a number"]')
    .should('be.visible')
    .click()

  cy.contains(/your queue number is/i)
    .should('be.visible')

  // Coffee icon
  cy.get('img[alt="Skip queue"]')
    .should('be.visible')
    .click()

  // Buy coffee
  cy.contains('Buy Me a Coffee')
    .should('be.visible')
    .click()
  
  cy.contains('Get Out')
    .should('be.visible')
    .click()
  
  cy.wait(3000); // Wait for window.open to be called

  cy.intercept(
    'PUT',
    '/user/homescreen/tasks/*',
    {
      statusCode: 200,
      body: {
        data: {
          isTaskCompleted: true
        }
      }
    }
  ).as('putTaskCheck')

  cy.contains('Submit Signature')
    .should('be.visible')
    .click()

  cy.wait('@putTaskCheck') 
});

// Complete Puzzle Task
Cypress.Commands.add('solvePuzzle', () => {
  cy.get('input', { timeout: 8000 }).should('be.visible');

  cy.get('body')
    .invoke('text')
    .then((rawText) => {
      const text = rawText.replace(/\s+/g, ' ').trim();

      const puzzle = puzzleAnswerMap.find(p =>
        text.includes(p.match)
      );

      expect(
        puzzle,
        'Puzzle match found in page text'
      ).to.exist;

      cy.get('input')
        .clear()
        .type(puzzle.answer);

      cy.contains('Submit Answer').click();
    });
});
