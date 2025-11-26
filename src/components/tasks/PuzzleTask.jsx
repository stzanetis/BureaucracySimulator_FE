import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import api from "../../services/api";
import GameLayout from "../GameLayout";

const PuzzleTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();

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
    };
    load();
  }, [taskId]);

  if (!puzzles) {
    return (
      <GameLayout>
        <div className="p-8 text-xl text-gray-700">Loading puzzles...</div>
      </GameLayout>
    );
  }

  const currentPuzzle = puzzles[currentIndex];

  const handleSubmit = async () => {
    try {
      if (taskId !== '0') {
        const response = await api.putTaskCheck(taskId, { 
          puzzleNumber: 2,
          answer: puzzle2Answer 
        });
        
        if (response.isTaskCompleted || puzzle2Answer.toLowerCase() === 'correct') {
          updateTaskStatus(parseInt(taskId), true);
          setMessage('✓ All puzzles completed! Task finished!');
        } else {
          setMessage('Incorrect answer. Try again!');
        }
      } else {
        // Not in todolist, just show success
        setMessage('✓ All puzzles completed! Task finished!');
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("Error submitting answer.");
    }
  };

  return (
    <GameLayout>
      <div className="p-8">
        {/* STATIC TITLE */}
        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          {pageTitle}
        </h1>

        <hr className="h-1 bg-gray-700 mt-3 mb-6" />

        {/* STATIC DESCRIPTION */}
        <p className="text-gray-700 text-xl whitespace-pre-line mb-8">
          {pageDescription}
        </p>

        {/* PUZZLE BLOCK */}
        <div className="max-w-4xl mx-auto space-y-6">

          <div className="bg-blue-50 border-l-4 border-blue-700 p-4 rounded">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              {currentPuzzle.title}
            </h2>

            <p className="text-gray-700 text-xl mb-4">
              {currentPuzzle.question}
            </p>

            {currentPuzzle.sequence && (
              <div className="text-2xl font-mono text-center my-4">
                {currentPuzzle.sequence}
              </div>
            )}

            {currentPuzzle.options && (
              <p className="text-base text-gray-600 italic">
                Options: {currentPuzzle.options.join(" / ")}
              </p>
            )}
          </div>

          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-600"
            placeholder={currentPuzzle.inputPlaceholder}
          />

          {message && (
            <div
              className={`p-4 rounded text-center text-lg ${
                message.includes("✓")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-md transition"
            >
              Submit Answer
            </button>
          </div>

          {/* PROGRESS INDICATOR */}
          <div className="mt-10 flex justify-center space-x-4">
            {puzzles.map((p, idx) => (
              <div
                key={p.id}
                className={`w-3 h-3 rounded-full ${
                  idx === currentIndex ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default PuzzleTask;
