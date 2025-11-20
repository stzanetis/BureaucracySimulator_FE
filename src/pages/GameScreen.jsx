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

        {/* === HEADER: Title + Line === */}
        <h1 className="text-6xl font-bold text-gray-800 mb-2">
          Welcome User
        </h1>
        <hr className="h-1 bg-gray-700 mt-3 mb-6"/>

        {/* === MAIN CONTENT ROW === */}
        <div className="flex justify-between items-start">

          {/* LEFT TEXT BLOCK */}
          <div className="max-w-[70%] text-xl text-gray-700 leading-relaxed space-y-8">

            <p>
              Your presence has been acknowledged. By accessing this portal you affirm
              your compliance to Statute 47-B, governing the submission of all necessary,
              unnecessary and yet-to-be-defined reports. Before proceeding, please be
              advised that failure to adhere to established guidelines may result in
              indefinite processing delays, conditional rejection, or retroactive
              non-compliance penalties.
            </p>

            <p>
              You have been assigned the task of Filing a Standard Judicial Report for
              citizen K. Please be aware that a report cannot be submitted until all
              necessary prerequisites—both known and yet-to-be-determined—have been met.
              Please ensure that all supplementary authorizations, approvals, and
              verification are obtained. Any errors in this process will be considered
              your responsibility, even if the error itself goes unnoticed.
            </p>

            <p className="font-semibold text-2xl">
              Proceed with caution.
            </p>

          </div>

          {/* RIGHT LOGO */}
          <img
            src="/Logo.png"
            alt="Game logo"
            className="ml-8 w-[clamp(8rem,12vw,14rem)] object-contain"
          />

        </div>

      </div>
    </GameLayout>
  );
};

export default GameScreen;