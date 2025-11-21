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
    } catch (error) {
      console.error('Error submitting puzzle 1:', error);
      setMessage('Error submitting. Try again.');
    }
  };

  const handlePuzzle2Submit = async () => {
    try {
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
    } catch (error) {
      console.error('Error submitting puzzle 2:', error);
      setMessage('Error submitting. Try again.');
    }
  };

  return (
    <GameLayout>
      <div className="p-8">

        {/* === HEADER — same as Form Task === */}
        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          Mental Coherence Review
        </h1>

        <hr className="h-1 bg-gray-700 mt-3 mb-6" />

        <p className="text-gray-700 text-xl max-w-12xl mb-3">
          As part of your routine evaluative review and in accordance with Regulation 14-R on Authorized Thought Patterns, 
          all participants must undergo a brief cognitive alignment check to ensure ongoing compatibility with departmental standards.<br></br>
          You are instructed to fulfill the following cognitive verification test.<br></br>
          Your responses will be reviewed to confirm that reasoning deviations remain within acceptable administrative thresholds.<br></br>
          Failure to provide sufficiently coherent responses may result in additional clarification procedures.
        </p>

        <p className="text-gray-700 text-xl max-w-3xl mb-13">
          Complete the following puzzles to proceed.
        </p>

        {/* === CONTENT WRAPPER === */}
        <div className="max-w-3xl mx-auto">

          {/* ===== PUZZLE 1 ===== */}
          {currentPuzzle === 1 ? (
            <div className="space-y-6">

              {/* Puzzle Block */}
              <div className="bg-blue-50 border-l-4 border-blue-700 p-4">
                <h2 className="text-xl font-bold text-blue-900 mb-2">
                  Puzzle 1: Logic Challenge
                </h2>
                <p className="text-gray-700 text-lg mb-4">
                  If all Glorps are Zinks, and some Zinks are Flibs,
                  can we conclude that some Glorps are Flibs?
                </p>
                <p className="text-base text-gray-600">
                  Options: Yes / No / Cannot be determined
                </p>
              </div>

              {/* Input */}
              <input
                type="text"
                value={puzzle1Answer}
                onChange={(e) => setPuzzle1Answer(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500"
                placeholder="Type your answer..."
              />

              {/* Message */}
              {message && (
                <div className={`p-4 rounded-lg text-center ${
                  message.includes('✓')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              {/* Submit */}
              <div className="flex justify-center">
                <button
                  onClick={handlePuzzle1Submit}
                  className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-md transition"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          ) : (
          /* ===== PUZZLE 2 ===== */
            <div className="space-y-6">

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                <h2 className="text-xl font-bold text-blue-900 mb-2">
                  Puzzle 2: Pattern Recognition
                </h2>
                <p className="text-gray-700 text-lg mb-4">
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
                className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500"
                placeholder="Type your answer..."
              />

              {message && (
                <div className={`p-4 rounded-lg text-center ${
                  message.includes('✓')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handlePuzzle2Submit}
                  className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-md transition"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          )}

          {/* Puzzle Indicator */}
          <div className="mt-10 flex justify-center space-x-4">
            <div
              className={`w-3 h-3 rounded-full ${
                currentPuzzle === 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
            <div
              className={`w-3 h-3 rounded-full ${
                currentPuzzle === 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          </div>

        </div>
      </div>
    </GameLayout>
  );
};

export default PuzzleTask;
