import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import StartScreen from './pages/StartScreen';
import GameScreen from './pages/GameScreen';
import EndScreen from './pages/EndScreen';
import LeaderboardScreen from './pages/LeaderboardScreen';
import CreditsScreen from './pages/CreditsScreen';
import CaptchaTask from './components/tasks/CaptchaTask';
import FormTask from './components/tasks/FormTask';
import PuzzleTask from './components/tasks/PuzzleTask';
import CoffeeTask from './components/tasks/CoffeeTask';
import SignatureTask from './components/tasks/SignatureTask';
import DisplayTask from './components/tasks/DisplayTask';

// Application root component.
// Defines global providers and client-side routing.
function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          {/* Main screens */}
          <Route path="/" element={<StartScreen />} />
          <Route path="/leaderboard" element={<LeaderboardScreen />} />
          <Route path="/credits" element={<CreditsScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/end" element={<EndScreen />} />
          
          {/* Task Routes */}
          <Route path="/game/task/captcha/:taskId" element={<CaptchaTask />} />
          <Route path="/game/task/form/:taskId" element={<FormTask />} />
          <Route path="/game/task/puzzle/:taskId" element={<PuzzleTask />} />
          <Route path="/game/task/coffee/:taskId" element={<CoffeeTask />} />
          <Route path="/game/task/signature/:taskId" element={<SignatureTask />} />
          <Route path="/game/task/display/:taskId" element={<DisplayTask />} />
        </Routes>
      </Router>
    </GameProvider>
  )
}

export default App
