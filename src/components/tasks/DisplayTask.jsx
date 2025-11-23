import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import api from '../../services/api';
import GameLayout from '../GameLayout';

const DisplayTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();
  const [brightness, setBrightness] = useState(0.02); // Very low initial brightness
  const [message, setMessage] = useState('');

  const handleBrightnessUp = () => {
    setBrightness(prev => Math.min(prev + 0.1, 1));
  };

  const handleBrightnessDown = () => {
    setBrightness(prev => Math.max(prev - 0.1, 0.05));
  };

  const handleAudit = async () => {
    try {
      if (taskId !== '0') {
        const response = await api.putTaskCheck(taskId, { audited: true });
        
        if (response.isTaskCompleted) {
          updateTaskStatus(parseInt(taskId), true);
          setMessage('✓ Audit complete! Approval stamp granted!');
          setTimeout(() => navigate('/game'), 2000);
        }
      } else {
        // Not in todolist, just show success
        setMessage('✓ Audit complete! Approval stamp granted!');
        setTimeout(() => navigate('/game'), 2000);
      }
    } catch (error) {
      console.error('Error completing audit:', error);
      // Complete anyway if in todolist
      if (taskId !== '0') {
        updateTaskStatus(parseInt(taskId), true);
      }
      setMessage('✓ Audit complete! Approval stamp granted!');
      setTimeout(() => navigate('/game'), 2000);
    }
  };

  // Handle keyboard shortcuts with global listener
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '+' || e.key === '=') {
        handleBrightnessUp();
      } else if (e.key === '-' || e.key === '_') {
        handleBrightnessDown();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      {/* Full-screen dark overlay */}
      <div 
        className="fixed inset-0 bg-black pointer-events-none z-50 transition-opacity duration-300"
        style={{ opacity: 1 - brightness }}
      />
      
      <GameLayout>
        <div className="p-8">
          <div 
            className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Unjustified Audit Office
          </h1>

        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-4">
            This screen appears to have it's brightness severely reduced. We apologize for the inconvenience. 
          </p>
          <p className="text-gray-600 text-sm">
            Please proceed with the audit below... if you can see the button of course
          </p>
        </div>

        {/* Brightness Display Overlay */}
        <div className="flex items-center justify-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-4 mb-6 max-w-xs mx-auto">
          {/* Sun Icon */}
          <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
          </svg>
          
          {/* Progress Bar */}
          <div className="flex-1 bg-gray-300 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-gray-700 h-full transition-all duration-300"
              style={{ width: `${brightness * 100}%` }}
            />
          </div>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-400 text-green-800 p-4 rounded-lg mb-4">
            {message}
          </div>
        )}

        <button
          onClick={handleAudit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          Complete Audit
        </button>
      </div>
      </div>
    </GameLayout>
    </>
  );
};

export default DisplayTask;
