# Bureaucracy Simulator - E2E Testing Guide

## Overview
This guide explains how to run and develop E2E tests for the Bureaucracy Simulator application using Cypress.

## Test Structure

### Test Files
All E2E tests are located in `cypress/e2e/bureaucracy-simulator/`:

- **start-screen.cy.js** - Tests for the start/home screen
- **game-screen.cy.js** - Tests for the main game screen
- **end-screen.cy.js** - Tests for the game completion screen
- **leaderboard-screen.cy.js** - Tests for the leaderboard
- **credits-screen.cy.js** - Tests for the about us/credits screen
- **full-user-journey.cy.js** - Complete end-to-end user flow tests

### Custom Commands
Reusable commands are defined in `cypress/support/commands.js`:

- `cy.startGame(nickname)` - Start a new game with a nickname
- `cy.mockApiResponses()` - Mock all API endpoints
- `cy.mockLeaderboard(entries)` - Mock leaderboard data
- `cy.mockAboutUs(text)` - Mock about us content
- `cy.mockEndscreen(percentile)` - Mock endscreen results
- `cy.mockApiError(endpoint, method)` - Mock API errors
- `cy.visitAndWait(path, alias)` - Navigate and wait for load
- `cy.setupGameContext()` - Setup game state

## Prerequisites

Before running tests, ensure both the backend and frontend servers are running:

### 1. Start the Backend Server
```powershell
# In the BureaucracySimulator_BE directory
cd ..\BureaucracySimulator_BE
npm start
# Backend will run on http://localhost:4000
```

### 2. Start the Frontend Dev Server
```powershell
# In the BureaucracySimulator_FE directory
npm run dev
# Frontend will run on http://localhost:5173
```

## Running Tests

### Interactive Mode (Development)
Open Cypress Test Runner to run tests interactively and debug:

```powershell
npm run cypress:open
```

This will:
- Open the Cypress Test Runner UI
- Allow you to select and run individual test files
- Show real-time test execution in the browser
- Enable debugging with browser DevTools
- Auto-reload tests when files change

### Headless Mode (CI/CD)
Run all tests in headless mode for continuous integration:

```powershell
npm run cypress:run
```

This will:
- Run all tests without opening a browser window
- Generate test reports
- Take screenshots on failure
- Complete faster for automated testing

### Run Specific Test File
To run a specific test file in headless mode:

```powershell
npx cypress run --spec "cypress/e2e/bureaucracy-simulator/start-screen.cy.js"
```

### Run Tests in Specific Browser
```powershell
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
```

## Test Coverage

### Happy Paths ✅
Each screen includes tests for:
- Successful user interactions
- Proper data display
- Navigation flows
- Form submissions
- API integration
- UI responsiveness

### Unhappy Paths ⚠️
Each screen includes tests for:
- Empty/invalid inputs
- API failures and timeouts
- Missing or malformed data
- Network errors
- Edge cases (special characters, long inputs, etc.)
- Error recovery

## Configuration

### Cypress Config (`cypress.config.js`)
```javascript
{
  baseUrl: 'http://localhost:5173',  // Vite dev server
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,                       // Disable video recording
  screenshotOnRunFailure: true,       // Take screenshots on failure
  env: {
    apiUrl: 'http://localhost:4000'   // Backend API URL
  },
  retries: {
    runMode: 2,                        // Retry failed tests 2 times in CI
    openMode: 0                        // No retries in interactive mode
  }
}
```

### Environment Variables
The `.env` file is already configured with the correct credentials:
```
VITE_API_BASE_URL=http://localhost:4000
VITE_API_USERNAME=admin
VITE_API_PASSWORD=supersecret
```

**Important:** The backend requires Basic Authentication. All API calls must include the Authorization header with credentials `admin:supersecret`.

## Best Practices

### 1. Mock API Responses
Always mock API calls for consistent, fast tests:
```javascript
beforeEach(() => {
  cy.mockApiResponses();
});
```

### 2. Use Custom Commands
Leverage custom commands for common operations:
```javascript
cy.startGame('TestPlayer');
cy.mockLeaderboard([...]);
```

### 3. Wait for API Calls
Wait for API calls to complete before assertions:
```javascript
cy.wait('@postUser');
cy.url().should('include', '/game');
```

### 4. Test Isolation
Each test should be independent and not rely on others:
```javascript
beforeEach(() => {
  cy.clearLocalStorage();
  cy.mockApiResponses();
});
```

### 5. Descriptive Test Names
Use clear, descriptive test names:
```javascript
it('should display error message when submitting empty nickname', () => {
  // test code
});
```

## Debugging Tests

### Debug in Interactive Mode
1. Run `npm run cypress:open`
2. Click on the test file to run
3. Click on any test step to see details
4. Use browser DevTools for debugging
5. Add `cy.pause()` to pause test execution
6. Use `cy.debug()` to debug specific elements

### Debug with Console
```javascript
cy.get('.element').then(($el) => {
  console.log('Element:', $el);
  debugger; // Browser will pause here
});
```

### Screenshots and Videos
Failed tests automatically save screenshots to:
- `cypress/screenshots/`

Enable video recording in config for full test runs:
- `cypress/videos/`

## Common Issues

### Issue: Tests fail due to timing
**Solution:** Add proper waits for API calls and animations
```javascript
cy.wait('@apiCall');
cy.get('.element', { timeout: 10000 }).should('be.visible');
```

### Issue: Can't find elements
**Solution:** Use better selectors (data attributes, specific text)
```javascript
// Good
cy.get('[data-testid="submit-button"]').click();
cy.contains('button', 'Play').click();

// Avoid
cy.get('button').eq(2).click();
```

### Issue: Flaky tests
**Solution:** 
- Mock API responses consistently
- Use explicit waits
- Avoid time-based assertions
- Enable retries in CI mode

## Writing New Tests

### Test Template
```javascript
describe('ScreenName - E2E Tests', () => {
  beforeEach(() => {
    cy.mockApiResponses();
    cy.visit('/route');
  });

  describe('Happy Paths', () => {
    it('should perform expected action', () => {
      // Arrange
      cy.get('input').type('value');
      
      // Act
      cy.get('button').click();
      
      // Assert
      cy.url().should('include', '/expected');
      cy.contains('Success').should('be.visible');
    });
  });

  describe('Unhappy Paths', () => {
    it('should handle error gracefully', () => {
      cy.mockApiError('**/endpoint/', 'POST');
      
      cy.get('button').click();
      cy.wait('@apiError');
      
      cy.contains('Error message').should('be.visible');
    });
  });
});
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  cypress:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Start dev server
        run: npm run dev &
      - name: Run Cypress tests
        run: npm run cypress:run
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress API](https://docs.cypress.io/api/table-of-contents)

## Support

For issues or questions about the tests:
1. Check test output for error messages
2. Review the test file for the failing test
3. Use Cypress interactive mode to debug
4. Check API mocks are correctly configured
