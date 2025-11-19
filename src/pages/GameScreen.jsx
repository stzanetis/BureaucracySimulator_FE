import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import GameLayout from '../components/GameLayout';

const GameScreen = () => {
  const { tasks, startTimer } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    // Start the timer when entering the game screen
    startTimer();
  }, [startTimer]);

  // Redirect to start if no tasks
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      navigate('/');
    }
  }, [tasks, navigate]);

  return (
    <GameLayout>
      <div className="p-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">Welcome User</h1>
        <hr className="h-1 bg-gray-700 my-2"/>
        <p className="text-xl text-gray-600 mb-8">
          Complete all your assigned tasks. Click on each department in the sidebar to get started.
        </p>
        <img className="fixed right-[500px] top-[200px] h-96" src="Logo.png"/>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Click on departments in the left sidebar to view your assigned tasks</li>
            <li>• Your to-do list is displayed on the right side</li>
            <li>• Each task must be completed before you can finish the game</li>
            <li>• You can switch between tasks at any time</li>
            <li>• Pay attention to task details and requirements</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
};

export default GameScreen;