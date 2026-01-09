import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import api from '../../services/api';
import GameLayout from '../GameLayout';

// Coffee task screen.
// Simulates queue waiting, optional bribery, and document submission.
const CoffeeTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();

  // Task flow state (queue → coffee prompt → bribery success → upload)
  const [stage, setStage] = useState('queue'); // queue, coffee-prompt, bribery-success, upload
  const [queueNumber, setQueueNumber] = useState(0);
  const [myNumber, setMyNumber] = useState(null);

  // File upload and feedback state
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Initialize queue
    setQueueNumber(Math.floor(Math.random() * 100));
  }, []);

  // Assign a queue number and simulate queue progression
  const handleTakeNumber = () => {
    const number = Math.floor(Math.random() * 900) + 100;
    setMyNumber(number);
    
    // Auto-increment queue number
    const interval = setInterval(() => {
      setQueueNumber(prev => {
        if (prev >= number) {
          clearInterval(interval);
          return number;
        }
        return prev + 1;
      });
    }, 200);
  };

  // Queue-skipping and navigation handlers
  const handleSkipQueue = () => {
    setStage('coffee-prompt');
  };

  // Simulate bribery / payment check
  const handleBuyCoffee = async () => {
    try {
      const response = await api.getTaskPaymentStatus();
      if (response.paymentAccepted) {
        setStage('bribery-success');
      } else {
        // Open payment portal
        window.open('https://www.buymeacoffee.com/bureaucracy', '_blank');
        setTimeout(() => {
          setStage('bribery-success');
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      // Proceed anyway for demo
      setStage('bribery-success');
    }
  };

  const handleGoBack = () => {
    setStage('queue');
  };

  const handleProceed = () => {
    setStage('upload');
  };

  // Track selected file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Validate and submit uploaded document
  const handleFileSubmit = async () => {
    if (!file) {
      setMessage('Please select a file!');
      return;
    }

    if (!file.name.endsWith('.epub')) {
      setMessage('File must be in *.epub format!');
      return;
    }

    try {
      if (taskId !== '0') {
        const response = await api.putTaskCheck(taskId, { 
          fileName: file.name,
          fileType: file.type 
        });
        
        if (response.isTaskCompleted) {
          updateTaskStatus(parseInt(taskId), true);
          setMessage('✓ File accepted! Approval stamp granted!');
        } else {
          setMessage('File rejected. Please try again.');
        }
      } else {
        // Not in todolist, just show success
        setMessage('✓ File accepted! Approval stamp granted!');
        setTimeout(() => navigate('/game'), 2000);
      }
    } catch (error) {
      console.error('Error submitting file:', error);
      setMessage('Error submitting file.');
    }
  };

  return (
    <GameLayout>
      <div className="p-8">

        {/* === HEADER: Title + Line === */}
        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          Secretariat of Drowsiness
        </h1>
        <hr className="h-1 bg-gray-700 mt-3 mb-6"/>

        {/* === MAIN CONTENT ROW === */}
        <div className="flex justify-between items-start gap-8">

          {/* LEFT TEXT BLOCK */}
          <div className="flex-1 text-xl text-gray-700 leading-relaxed space-y-8">
            <p>
              Welcome to our lax department... Please be aware that our staff is currently experiencing a high volume of requests, and wait times may be substantial. We ask for your patience and understanding during this process.
            </p>
            <p>
              For those who wish to expedite their service, alternative arrangements may be available through informal channels. However, we remind all visitors that such transactions are entirely at their own discretion and risk.
            </p>
          </div>

          {/* RIGHT INTERACTIVE PANEL */}
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
            {stage === 'queue' && (
              <div>
                <div className="bg-[#5b94df] rounded-t-lg p-8">
                  <div className="text-center">
                    <div className="text-2xl text-white mb-4 font-semibold">Now Serving:</div>
                    <div className="bg-white rounded-lg py-6 px-4 inline-block">
                      <div className="text-7xl font-bold text-gray-800 tracking-wider">{String(queueNumber).padStart(3, '0')}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {!myNumber ? (
                    <div className="flex items-center gap-4">
                      <img 
                        src="/queue-ticket.png" 
                        alt="Take a number"
                        onClick={handleTakeNumber}
                        className="w-24 h-24 object-contain cursor-pointer hover:scale-110 transition-transform shrink-0"
                      />
                      <p className="text-gray-700 font-semibold text-lg uppercase">
                        Please take a number and wait for your turn...
                      </p>
                    </div>
                  ) : queueNumber >= myNumber ? (
                    <button
                      onClick={handleProceed}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                    >
                      Proceed to Service
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <img 
                        src="/coffee.png" 
                        alt="Get coffee"
                        onClick={handleSkipQueue}
                        className="w-24 h-24 object-contain cursor-pointer hover:scale-110 transition-transform shrink-0"
                      />
                      <p className="text-gray-700 font-semibold text-lg uppercase">
                        Your queue number is <span className="text-blue-800">{myNumber}</span>, thank you for your patience
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {stage === 'coffee-prompt' && (
              <div>
                <div className="bg-amber-500 rounded-t-lg p-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Tired of waiting?</h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-gray-700 text-lg mb-11">
                    You can propably <span className="text-blue-800">skip</span> all this waiting if you help the agency to wake up...
                  
                  </p>

                  <button
                    onClick={handleBuyCoffee}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                  >
                    ☕ Buy Me a Coffee
                  </button>
                  <button
                    onClick={handleGoBack}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Go Back to Queue
                  </button>
                </div>
              </div>
            )}

            {stage === 'bribery-success' && (
              <div>
                <div className="bg-green-600 rounded-t-lg p-6">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Bribery is so good
                  </h2>
                </div>
                <div className="p-6 space-y-12">
                  <p className="text-gray-700 text-lg">
                    Thank you for the "coffee"! You may now proceed directly to the front of the line.
                  </p>

                  <button
                    onClick={handleProceed}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                  >
                    Proceed to Service
                  </button>
                </div>
              </div>
            )}

            {stage === 'upload' && (
              <div>
                <div className="bg-[#5b94df] rounded-t-lg p-6">
                  <p className="text-white font-semibold text-xl">
                    Please upload the correct document for review
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                    <p className="text-blue-900 font-semibold mb-4">
                      Required: Document must be in *.epub format
                    </p>
                    
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".epub"
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500"
                    />

                    {file && (
                      <p className="text-sm text-gray-600 mt-3">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>

                  {message && (
                    <div className={`p-4 rounded-lg ${
                      message.includes('✓')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {message}
                    </div>
                  )}

                  <button
                    onClick={handleFileSubmit}
                    className="w-full bg-[#5b94df] hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                  >
                    Submit Document
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </GameLayout>
  );
};

export default CoffeeTask;
