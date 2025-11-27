import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import api from '../../services/api';
import GameLayout from '../GameLayout';

const SignatureTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();
  const [stage, setStage] = useState('queue'); // queue, coffee-prompt, kicked-out, forge
  const [queueNumber, setQueueNumber] = useState(0);
  const [myNumber, setMyNumber] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    setQueueNumber(Math.floor(Math.random() * 100));
  }, []);

  const handleTakeNumber = () => {
    const number = Math.floor(Math.random() * 900) + 100;
    setMyNumber(number);
    
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

  const handleBribe = () => {
    setStage('kicked-out');
  };

  const handleGoBack = () => {
    setStage('queue');
  };

  const handleGetOut = () => {
    setTimeout(() => {
      setStage('forge');
    }, 2000);
  };

  const handleForge = () => {
    setStage('forge');
  };

  // Canvas drawing functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmitSignature = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple check: count non-white pixels
    let pixelCount = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 255) pixelCount++;
    }
    
    // If enough pixels drawn, consider it "good enough"
    const isGoodEnough = pixelCount > 500;

    try {
      if (taskId !== '0') {
        const response = await api.putTaskCheck(taskId, { 
          signatureQuality: isGoodEnough ? 'good' : 'poor'
        });
        
        if (isGoodEnough || response.isTaskCompleted) {
          updateTaskStatus(parseInt(taskId), true);
          setMessage('✓ Signature accepted! Task completed!');
        } else {
          setMessage('❌ Signature detected as fake! You must start over.');
          setTimeout(() => {
            setStage('queue');
            setMyNumber(null);
            setQueueNumber(Math.floor(Math.random() * 100));
            clearCanvas();
          }, 2000);
        }
      } else {
        // Not in todolist, just show success if good enough
        if (isGoodEnough) {
          setMessage('✓ Signature accepted! Task completed!');
        } else {
          setMessage('❌ Signature detected as fake! You must start over.');
          setTimeout(() => {
            setStage('queue');
            setMyNumber(null);
            setQueueNumber(Math.floor(Math.random() * 100));
            clearCanvas();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error submitting signature:', error);
      setMessage('Error submitting signature.');
    }
  };

  return (
    <GameLayout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Serious Headquarters of Seriousness
        </h1>

        {stage === 'queue' && (
          <div>
            <p className="text-gray-700 mb-6">
              You need an official signature. Please wait in the queue.
            </p>

            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600 mb-2">Current Number:</div>
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
                onClick={() => setStage('upload')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors mb-4"
              >
                Proceed
              </button>
            ) : (
              <div className="text-center text-gray-600 mb-4">
                Waiting... ({myNumber - queueNumber} ahead)
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
              <p className="text-gray-700">
                Want to bribe us with coffee? Think again...
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleBribe}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
              >
                ☕ Buy Me a Coffee
              </button>
              <button
                onClick={handleGoBack}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {stage === 'kicked-out' && (
          <div>
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-6 mb-6">
              <h2 className="text-3xl font-bold text-red-900 mb-4">
                YOU CANNOT BRIBE US! 🚫
              </h2>
              <p className="text-gray-700 mb-4">
                How dare you attempt to bribe the Serious Headquarters of Seriousness!
              </p>
              <p className="text-gray-700">
                You are hereby kicked out!
              </p>
            </div>

            <button
              onClick={handleGetOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Get Out
            </button>
          </div>
        )}

        {stage === 'forge' && (
          <div>
            <div className="bg-gray-50 border-2 border-gray-400 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Outside the Building
              </h2>
              <p className="text-gray-700 mb-4">
                Well, that didn't work. Now you'll have to forge the signature yourself!
              </p>
              <p className="text-sm text-gray-600">
                Trace the signature as accurately as possible:
              </p>
            </div>

            <div className="mb-4">
              <div className="text-center mb-2 text-gray-700 font-semibold">
                Original Signature:
              </div>
              <div className="bg-gray-100 p-4 rounded text-center font-cursive text-3xl italic">
                John Q. Bureaucrat
              </div>
            </div>

            <div className="mb-4">
              <div className="text-center mb-2 text-gray-700 font-semibold">
                Your Signature:
              </div>
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border-2 border-gray-400 rounded w-full cursor-crosshair bg-white"
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

            <div className="flex gap-4">
              <button
                onClick={clearCanvas}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleSubmitSignature}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                I am Ready
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </GameLayout>
  );
};

export default SignatureTask;
