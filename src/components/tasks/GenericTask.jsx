import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import api from '../../services/api';
import GameLayout from '../GameLayout';

const GenericTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await api.putTaskCheck(taskId, { input: userInput });
      
      if (response.isTaskCompleted) {
        updateTaskStatus(parseInt(taskId), true);
        setMessage('✓ Task completed successfully!');
        setTimeout(() => navigate('/game'), 2000);
      } else {
        setMessage('Please try again with different input.');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      setMessage('Error submitting. Please try again.');
    }
  };

  return (
    <GameLayout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Task {taskId}
        </h1>

        <p className="text-gray-700 mb-6">
          Complete this bureaucratic task to proceed.
        </p>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Enter Required Information:
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows="5"
            className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500"
            placeholder="Type your response here..."
          />
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-4 ${
            message.includes('✓')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Submit
        </button>
      </div>
      </div>
    </GameLayout>
  );
};

export default GenericTask;
