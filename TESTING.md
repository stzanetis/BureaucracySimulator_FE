# Running E2E Tests - Quick Start

## Setup

1. **Install dependencies** (if not already done):
   ```powershell
   npm install
   ```

2. **Configure environment** (already set up):
   - `.env` file contains backend API URL and credentials
   - Backend runs on `http://localhost:4000`
   - Frontend runs on `http://localhost:5173`

## Running Tests

### Option 1: With Backend Running (Integration Tests)
Tests will make real API calls to your running backend:

```powershell
# Terminal 1 - Start Backend
cd ..\BureaucracySimulator_BE
npm start

# Terminal 2 - Start Frontend  
cd ..\BureaucracySimulator_FE
npm run dev

# Terminal 3 - Run Cypress Tests
npm run cypress:open
```

### Option 2: With Mocked APIs (Unit Tests)
Tests use mocked API responses (no backend needed):

```powershell
# Terminal 1 - Start Frontend
npm run dev

# Terminal 2 - Run Cypress Tests
npm run cypress:open
```

The tests are designed to work with **mocked API responses**, so the backend is optional for most tests.

## Test Commands

```powershell
# Open Cypress Test Runner (interactive, with browser)
npm run cypress:open

# Run all tests headlessly (CI mode)
npm run cypress:run

# Run specific test file
npx cypress run --spec "cypress/e2e/bureaucracy-simulator/start-screen.cy.js"

# Run tests in specific browser
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
```

## Authentication

All API endpoints require Basic Authentication:
- **Username:** `admin`
- **Password:** `supersecret`

These credentials are:
- Configured in backend `.env` file
- Configured in frontend `.env` file
- Automatically included in Cypress mocked requests

## Troubleshooting

### Tests fail with "Network Error"
- ✅ Check that frontend dev server is running on `http://localhost:5173`
- ✅ Check `.env` file has correct API URL and credentials
- ✅ If testing against real backend, ensure it's running on `http://localhost:4000`

### Tests fail with "401 Unauthorized"
- ✅ Verify `.env` has correct credentials: `admin:supersecret`
- ✅ Restart dev server after changing `.env` file
- ✅ Check backend `.env` has matching credentials

### Element not found errors
- ✅ Run tests in interactive mode: `npm run cypress:open`
- ✅ Inspect the page to verify element selectors
- ✅ Check if components are rendering correctly

### Tests are slow
- ✅ Use mocked API responses (default behavior)
- ✅ Close unnecessary browser tabs
- ✅ Run specific test files instead of entire suite

## Test Files

- `start-screen.cy.js` - Start screen tests (nickname input, navigation)
- `game-screen.cy.js` - Game screen tests (game flow, timer)
- `end-screen.cy.js` - End screen tests (results, score display)
- `leaderboard-screen.cy.js` - Leaderboard tests (rankings, data display)
- `credits-screen.cy.js` - Credits screen tests (about us content)
- `full-user-journey.cy.js` - Complete end-to-end user flows

## Next Steps

For detailed information, see:
- 📖 [Full E2E Testing Guide](./cypress/E2E_TESTING_GUIDE.md)
- 📝 [Custom Commands](./cypress/support/commands.js)
- ⚙️ [Cypress Configuration](./cypress.config.js)
