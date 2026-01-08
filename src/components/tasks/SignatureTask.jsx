import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import api from '../../services/api';
import GameLayout from '../GameLayout';

const SignatureTask = () => {
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

        {/* === HEADER: Title + Line === */}
        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          Serious Headquarters of Seriousness
        </h1>
        <hr className="h-1 bg-gray-700 mt-3 mb-6"/>

        {/* === MAIN CONTENT ROW === */}
        <div className={`flex ${stage === 'forge' ? 'justify-center' : 'justify-between items-start gap-8'}`}>

          {/* LEFT TEXT BLOCK */}
          {stage !== 'forge' && (
            <div className="flex-1 text-xl text-gray-700 leading-relaxed space-y-8">
              <p>
                Welcome to the Serious Headquarters of Seriousness, where matters of utmost importance are handled with the gravity they deserve. You require an official signature for your documentation.
              </p>
              <p>
                Please be advised that attempts to circumvent proper procedures through informal means will not be tolerated at this establishment. We maintain the highest standards of integrity and professionalism, so no ammount of free coffee will help your case.
              </p>
            </div>
          )}

          {/* RIGHT INTERACTIVE PANEL */}
          <div className={`${stage === 'forge' ? 'max-w-2xl w-full' : 'flex-1'} bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden`}>
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
                  {message && (
                    <div className={`p-4 rounded-lg mb-4 ${
                      message.includes('✓')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {message}
                    </div>
                  )}
                  
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
                      onClick={async () => {
                        try {
                          if (taskId !== '0') {
                            await api.putTaskCheck(taskId, { signatureReceived: true });
                            updateTaskStatus(parseInt(taskId), true);
                          }
                          setMessage('✓ Signature received! Task completed!');
                        } catch (error) {
                          console.error('Error completing task:', error);
                          setMessage('✓ Signature received! Task completed!');
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                    >
                      Proceed to Service
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <img 
                        src="/coffee.png" 
                        alt="Skip queue"
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
                  <p className="text-gray-700 text-lg mb-12">
                    You can try buying us a "coffee" to skip the queue...
                  </p>

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
                    I am too scared to bribe
                  </button>
                </div>
              </div>
            )}

            {stage === 'kicked-out' && (
              <div>
                <div className="bg-red-600 rounded-t-lg p-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    YOU CANNOT BRIBE US!
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-gray-700 text-lg mb-4">
                    How dare you attempt to bribe the Serious Headquarters of Seriousness!
                  </p>
                  <p className="text-gray-700 text-lg">
                    You are hereby kicked out!
                  </p>

                  <button
                    onClick={handleGetOut}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                  >
                    Get Out
                  </button>
                </div>
              </div>
            )}

            {stage === 'forge' && (
              <div>
                <div className="bg-[#5b94df] rounded-t-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Outside the Building
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-gray-700 text-lg mb-4">
                    Well, that didn't work. Now you'll have to forge the signature yourself!
                  </p>

                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-4">
                    <div className="text-center mb-2 text-gray-700 font-semibold">
                      Original Signature:
                    </div>
                    <div className="bg-gray-100 p-4 rounded text-center font-cursive text-3xl italic">
                      John Q. Bureaucrat
                    </div>
                  </div>

                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
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
                    <div className={`p-4 rounded-lg ${
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
                      className="flex-1 bg-[#5b94df] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Submit Signature
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </GameLayout>
  );
};

export default SignatureTask;
