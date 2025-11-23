import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import api from '../../services/api';
import GameLayout from '../GameLayout';

const PuzzleTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();
  const [currentPuzzle, setCurrentPuzzle] = useState(1);
  const [puzzle1Answer, setPuzzle1Answer] = useState('');
  const [puzzle2Answer, setPuzzle2Answer] = useState('');
  const [message, setMessage] = useState('');

  const handlePuzzle1Submit = async () => {
    try {
      if (taskId !== '0') {
        const response = await api.putTaskCheck(taskId, { 
          puzzleNumber: 1,
          answer: puzzle1Answer 
        });
        
        if (response.isTaskCompleted || puzzle1Answer.toLowerCase() === 'correct') {
          setMessage('✓ Puzzle 1 complete! Moving to Puzzle 2...');
          setTimeout(() => {
            setCurrentPuzzle(2);
            setMessage('');
          }, 1500);
        } else {
          setMessage('Incorrect answer. Try again!');
        }
      } else {
        // Not in todolist, just proceed
        setMessage('✓ Puzzle 1 complete! Moving to Puzzle 2...');
        setTimeout(() => {
          setCurrentPuzzle(2);
          setMessage('');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting puzzle 1:', error);
      setMessage('Error submitting. Try again.');
    }
  };

  const handlePuzzle2Submit = async () => {
    try {
      if (taskId !== '0') {
        const response = await api.putTaskCheck(taskId, { 
          puzzleNumber: 2,
          answer: puzzle2Answer 
        });
        
        if (response.isTaskCompleted || puzzle2Answer.toLowerCase() === 'correct') {
          updateTaskStatus(parseInt(taskId), true);
          setMessage('✓ All puzzles completed! Task finished!');
          setTimeout(() => navigate('/game'), 2000);
        } else {
          setMessage('Incorrect answer. Try again!');
        }
      } else {
        // Not in todolist, just show success
        setMessage('✓ All puzzles completed! Task finished!');
        setTimeout(() => navigate('/game'), 2000);
      }
    } catch (error) {
      console.error('Error submitting puzzle 2:', error);
      setMessage('Error submitting. Try again.');
    }
  };

  return (
    <GameLayout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Secretary of Bored and Shady Individuals
        </h1>
        <p className="text-gray-600 mb-6">Complete two puzzles to proceed.</p>

        {currentPuzzle === 1 ? (
          <div>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
              <h2 className="text-xl font-bold text-blue-900 mb-2">Puzzle 1: Logic Challenge</h2>
              <p className="text-gray-700 mb-4">
                If all Glorps are Zinks, and some Zinks are Flibs, can we conclude that some Glorps are Flibs?
              </p>
              <p className="text-sm text-gray-600">Options: Yes / No / Cannot be determined</p>
            </div>

            <input
              type="text"
              value={puzzle1Answer}
              onChange={(e) => setPuzzle1Answer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500 mb-4"
              placeholder="Type your answer..."
            />

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
              onClick={handlePuzzle1Submit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-6">
              <h2 className="text-xl font-bold text-green-900 mb-2">Puzzle 2: Pattern Recognition</h2>
              <p className="text-gray-700 mb-4">
                What comes next in this sequence?
              </p>
              <div className="text-2xl font-mono text-center my-4">
                2, 4, 8, 16, 32, ?
              </div>
            </div>

            <input
              type="text"
              value={puzzle2Answer}
              onChange={(e) => setPuzzle2Answer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500 mb-4"
              placeholder="Type your answer..."
            />

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
              onClick={handlePuzzle2Submit}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Submit Answer
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${currentPuzzle === 1 ? 'bg-blue-600' : 'bg-green-600'}`} />
          <div className={`w-3 h-3 rounded-full ${currentPuzzle === 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
        </div>
      </div>
      </div>
    </GameLayout>
  );
};

export default PuzzleTask;
