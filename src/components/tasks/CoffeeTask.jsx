import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import api from '../../services/api';
import GameLayout from '../GameLayout';

const CoffeeTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();
  const [stage, setStage] = useState('queue'); // queue, coffee-prompt, bribery-success, upload
  const [queueNumber, setQueueNumber] = useState(0);
  const [myNumber, setMyNumber] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Initialize queue
    setQueueNumber(Math.floor(Math.random() * 100));
  }, []);

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
    }, 100);
  };

  const handleSkipQueue = () => {
    setStage('coffee-prompt');
  };

  const handleBuyCoffee = async () => {
    try {
      const response = await api.getTaskPaymentStatus();
      if (response.paymentAccepted) {
        setStage('bribery-success');
      } else {
        // Open payment portal
        window.open('https://www.buymeacoffee.com', '_blank');
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

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
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Secretariat of Drowsiness
        </h1>

        {stage === 'queue' && (
          <div>
            <p className="text-gray-700 mb-6">
              You need an approval stamp. Please take a number and wait in the queue.
            </p>

            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600 mb-2">Current Number Being Served:</div>
                <div className="text-6xl font-bold text-yellow-600">{queueNumber}</div>
              </div>
              
              {myNumber && (
                <div className="text-center border-t-2 border-yellow-300 pt-4">
                  <div className="text-sm text-gray-600 mb-2">Your Number:</div>
                  <div className="text-4xl font-bold text-blue-600">{myNumber}</div>
                </div>
              )}
            </div>

            {!myNumber ? (
              <button
                onClick={handleTakeNumber}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors mb-4"
              >
                Take a Number
              </button>
            ) : queueNumber >= myNumber ? (
              <button
                onClick={handleProceed}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors mb-4"
              >
                Proceed
              </button>
            ) : (
              <div className="text-center text-gray-600 mb-4">
                Waiting for your number... ({myNumber - queueNumber} people ahead)
              </div>
            )}

            <button
              onClick={handleSkipQueue}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ☕ Skip the Queue?
            </button>
          </div>
        )}

        {stage === 'coffee-prompt' && (
          <div>
            <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">Skip the Queue?</h2>
              <p className="text-gray-700 mb-4">
                You can buy us a "coffee" to skip the queue... if you know what we mean. 😉
              </p>
              <p className="text-sm text-gray-600">
                (This will open a payment portal in a new window)
              </p>
            </div>

            <div className="space-y-4">
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
                Go Back, I am too scared to bribe
              </button>
            </div>
          </div>
        )}

        {stage === 'bribery-success' && (
          <div>
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-green-900 mb-4">
                Bribery is so good! 💰
              </h2>
              <p className="text-gray-700">
                Thank you for the "coffee"! You may now proceed directly to the front of the line.
              </p>
            </div>

            <button
              onClick={handleProceed}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Proceed
            </button>
          </div>
        )}

        {stage === 'upload' && (
          <div>
            <p className="text-gray-700 mb-6">
              Please upload the required document to receive your approval stamp.
            </p>

            <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 mb-6">
              <p className="text-blue-900 font-semibold mb-4">
                Required: Document must be in *.epub format
              </p>
              
              <input
                type="file"
                onChange={handleFileChange}
                accept=".epub"
                className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500 mb-4"
              />

              {file && (
                <p className="text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
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
              onClick={handleFileSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Submit Document
            </button>
          </div>
        )}
      </div>
      </div>
    </GameLayout>
  );
};

export default CoffeeTask;
