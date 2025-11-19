import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import api from '../services/api';

const EndScreen = () => {
  const navigate = useNavigate();
  const { elapsedTime, resetGame, nickname } = useGame();
  const [percentile, setPercentile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const submitScore = async () => {
      try {
        // Submit elapsed time with nickname
        const data = await api.postEndscreen(elapsedTime, nickname);
        // Response includes elapsedTime and percentile
        setPercentile(data?.percentile || 50);
      } catch (error) {
        console.error('Error submitting score:', error);
        setPercentile(50); // Default value
      } finally {
        setLoading(false);
      }
    };

    submitScore();
  }, [elapsedTime, nickname]);

  const handlePlayAgain = () => {
    resetGame();
    navigate('/');
  };

  const handleViewLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard();
      // Could show leaderboard modal here
      console.log('Leaderboard:', data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    if (percentile >= 90) return 'Outstanding! You are a bureaucracy master!';
    if (percentile >= 70) return 'Excellent work! The paperwork fears you!';
    if (percentile >= 50) return 'Good job! You navigated the red tape well!';
    if (percentile >= 30) return 'Not bad! Keep practicing those forms!';
    return 'You finished! Every journey through bureaucracy is a victory!';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-300 flex items-center justify-center">
        <div className="text-2xl text-gray-700">Calculating results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/Logo.png" alt="Bureaucracy Simulator" className="h-24 object-contain" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Congratulations!
        </h1>

        {/* Player Name */}
        <h2 className="text-2xl text-center text-gray-700 mb-8">
          {nickname}
        </h2>

        {/* Statistics */}
        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-gray-600 text-sm mb-2">Time Taken</div>
              <div className="text-4xl font-bold text-blue-600">
                {formatTime(elapsedTime)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 text-sm mb-2">Performance</div>
              <div className="text-4xl font-bold text-green-600">
                Top {percentile}%
              </div>
            </div>
          </div>
        </div>

        {/* Performance Message */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
          <p className="text-blue-900 text-center font-semibold">
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handlePlayAgain}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={handleViewLeaderboard}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            View Leaderboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Start
          </button>
        </div>

        {/* Quote */}
        <div className="mt-8 text-center text-gray-600 italic">
          "In bureaucracy, the journey is the destination, and the forms are eternal."
        </div>
      </div>
    </div>
  );
};

export default EndScreen;
