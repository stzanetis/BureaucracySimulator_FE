import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import api from '../../services/api';
import GameLayout from '../GameLayout';

const DisplayTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();
  const [brightness, setBrightness] = useState(0.05); // Very low initial brightness
  const [message, setMessage] = useState('');

  const handleBrightnessUp = () => {
    setBrightness(prev => Math.min(prev + 0.1, 1));
  };

  const handleBrightnessDown = () => {
    setBrightness(prev => Math.max(prev - 0.1, 0.05));
  };

  const handleAudit = async () => {
    try {
      const response = await api.putTaskCheck(taskId, { audited: true });
      
      if (response.isTaskCompleted) {
        updateTaskStatus(parseInt(taskId), true);
        setMessage('✓ Audit complete! Approval stamp granted!');
        setTimeout(() => navigate('/game'), 2000);
      }
    } catch (error) {
      console.error('Error completing audit:', error);
      // Complete anyway
      updateTaskStatus(parseInt(taskId), true);
      setMessage('✓ Audit complete! Approval stamp granted!');
      setTimeout(() => navigate('/game'), 2000);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === '+' || e.key === '=') {
      handleBrightnessUp();
    } else if (e.key === '-' || e.key === '_') {
      handleBrightnessDown();
    }
  };

  return (
    <GameLayout>
      <div 
        className="p-8 bg-gray-900"
        onKeyDown={handleKeyPress}
        tabIndex={0}
      >
        <div 
          className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8 transition-opacity duration-300"
          style={{ opacity: brightness }}
        >
          <h1 className="text-3xl font-bold text-white mb-4">
          Unjustified Audit Office
        </h1>

        <div className="bg-gray-700 border-2 border-gray-600 rounded-lg p-6 mb-6">
          <p className="text-gray-300 mb-4">
            We apologize for the inconvenience. The computer appears to be broken.
          </p>
          <p className="text-gray-400 text-sm">
            Please proceed with the audit if you can see the button below...
          </p>
        </div>

        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <p className="text-gray-400 text-sm mb-4">
            Tip: Try pressing the '+' key to increase brightness
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleBrightnessDown}
              className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
            >
              -
            </button>
            <div className="flex-1 bg-gray-900 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${brightness * 100}%` }}
              />
            </div>
            <button
              onClick={handleBrightnessUp}
              className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
            >
              +
            </button>
          </div>
          <div className="text-center text-gray-400 text-sm mt-2">
            Brightness: {Math.round(brightness * 100)}%
          </div>
        </div>

        {message && (
          <div className="bg-green-900 border border-green-600 text-green-100 p-4 rounded-lg mb-4">
            {message}
          </div>
        )}

        <button
          onClick={handleAudit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          Complete Audit
        </button>

        <div className="mt-6 text-center text-gray-500 text-xs">
          <p>Use + and - keys to adjust display brightness</p>
        </div>
      </div>
      </div>
    </GameLayout>
  );
};

export default DisplayTask;
