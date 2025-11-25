import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import api from "../../services/api";
import GameLayout from "../GameLayout";

const PuzzleTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();

  const [puzzles, setPuzzles] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  // HARD-CODED TITLE + DESCRIPTION
  const pageTitle = "Mental Coherence Review";
  const pageDescription =
    "As part of your routine evaluative review and in accordance with Regulation 14-R on Authorized Thought Patterns, all participants must undergo a brief cognitive alignment check to ensure ongoing compatibility with departmental standards.\nYou are instructed to fulfill the following cognitive verification test." + 
    "\nYour responses will be reviewed to confirm that reasoning deviations remain within acceptable administrative thresholds." + 
    "\nFailure to provide sufficiently coherent responses may result in additional clarification procedures." +
    "\n\nComplete the following puzzles to proceed.";

  // LOAD PUZZLES FROM BACKEND
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getPuzzleTask(taskId);
        console.log("API response:", res);

        setPuzzles(res.puzzles);
      } catch (err) {
        console.error("Error loading puzzle:", err);
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
      const res = await api.putPuzzleTaskCheck(taskId, {
        puzzleNumber: currentPuzzle.id,
        puzzleKey: currentPuzzle.puzzleKey,
        answer: answer.trim()
      });

      if (res.isTaskCompleted) {
        // LAST PUZZLE COMPLETED
        if (currentIndex === puzzles.length - 1) {
          setMessage("✓ All puzzles completed! Returning…");
          updateTaskStatus(parseInt(taskId), true);

          setTimeout(() => navigate("/game"), 1800);
        } else {
          // Move to next puzzle
          setMessage(`✓ Puzzle ${currentPuzzle.id} complete!`);
          setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setAnswer("");
            setMessage("");
          }, 1200);
        }
      } else {
        setMessage("Incorrect answer. Try again.");
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
