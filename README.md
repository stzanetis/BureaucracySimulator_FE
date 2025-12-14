# Bureaucracy Simulator Frontend

A React-based frontend for the Bureaucracy Simulator game. Navigate through various bureaucratic tasks, complete forms, solve puzzles, and experience the joy of red tape!

## Features

- **Complete Game Flow**: Start screen → Game screen → End screen
- **Multiple Task Types**: CAPTCHA, Forms, Puzzles, Coffee (bribery), Signature (forgery), Display (brightness), and more
- **State Management**: React Context API for global game state
- **API Integration**: Axios with basic authentication to Node.js backend
- **Responsive Design**: Tailwind CSS for modern, responsive UI
- **Timer System**: Real-time elapsed time tracking
- **Chatbot Assistant**: Helpful (and ominous) messages throughout gameplay
- **Random Popups**: Authentic bureaucratic experience (not yet implemented)

## Tech Stack

- React 19.2.0 with Vite
- React Router DOM 7.9.6 for routing
- Axios for HTTP requests with basic authentication
- Tailwind CSS 4.1.17 for styling

## Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:4000`

## Installation & Usage

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/tasks/    # Individual task components
├── context/            # Game state management
├── pages/              # Main screens (Start, Game, End)
├── services/           # API service layer
└── App.jsx            # Main app with routing
```

## API Endpoints Used (10+ endpoints)

1. GET /startscreen/ - Fetch song list
2. GET /leaderboard/ - Get leaderboard data
3. GET /about-us/ - Get about us text
4. POST /user/ - Submit nickname and seed
5. GET /user/homescreen/todolist - Get updated task list
6. GET /user/homescreen/tasks/{taskID}/ - Get specific task
7. PUT /user/homescreen/tasks/{taskID} - Submit task completion
8. GET /endscreen/ - Get final statistics
9. POST /endscreen/ - Submit elapsed time
10. GET /user/homescreen/tasks/9/payment-portal/ - Check payment status

## Game Screens (4+ screens)

1. **Start Screen**: Nickname entry, leaderboard, credits, music controls
2. **Game Screen**: Task list, timer, chatbot, department navigation
3. **Task Screens**: 7 different task types (CAPTCHA, Form, Puzzle, Coffee, Signature, Display, Generic)
4. **End Screen**: Statistics, percentile, play again option
