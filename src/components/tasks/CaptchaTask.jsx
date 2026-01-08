import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import GameLayout from '../GameLayout';
import api from '../../services/api';

const CaptchaTask = () => {
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();
  const [captchaData, setCaptchaData] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const reloadTimerRef = useRef(null);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const data = await api.getTaskById(taskId);
      // Backend returns task with captcha property
      // Shuffle images for random display order
      const shuffledImages = [...data.captcha.images].sort(() => Math.random() - 0.5);
      setCaptchaData({
        ...data.captcha,
        images: shuffledImages
      });
      setSelectedImages([]);
      setMessage('');
    } catch (error) {
      console.error('Error fetching CAPTCHA:', error);
    }
  };

  const handleImageClick = (id) => {
    setSelectedImages(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleReload = () => {
    // Clear existing timer
    if (reloadTimerRef.current) {
      clearTimeout(reloadTimerRef.current);
    }

    // Increment reload count
    const newCount = reloadCount + 1;
    setReloadCount(newCount);

    // Check if spammed 15 times
    if (newCount >= 15) {
      setMessage('✓ System Override Detected! Task Completed!');
      setTimeout(async () => {
        if (taskId !== '0') {
          await api.putTaskCheck(taskId, { override: true });
        }
        handleComplete();
      }, 1000);
      return;
    }

    // Reset counter after 2 seconds of inactivity
    reloadTimerRef.current = setTimeout(() => {
      setReloadCount(0);
    }, 2000);

    fetchCaptcha();
  };

  const handleSubmit = async () => {
    try {
      // Check if selected images match the correct ones
      const correctIds = captchaData.correctIds.sort();
      const selectedSorted = [...selectedImages].sort();
      
      const isCorrect = correctIds.length === selectedSorted.length &&
        correctIds.every((id, index) => id === selectedSorted[index]);

      if (isCorrect) {
        // Submit to backend to mark task as complete (only if in todolist)
        if (taskId !== '0') {
          await api.putTaskCheck(taskId, { selectedImages });
        }
        handleComplete();
      } else {
        setMessage('Incorrect! Please try again.');
        setTimeout(() => {
          fetchCaptcha();
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting CAPTCHA:', error);
      setMessage('Error submitting. Please try again.');
    }
  };

  const handleComplete = () => {
    if (taskId !== '0') {
      updateTaskStatus(parseInt(taskId), true);
    }
    setMessage('✓ Task Completed!');
  };

  return (
    <GameLayout>
      <div className="p-8">

        {/* === HEADER: Title + Line === */}
        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          Identification and Validation
        </h1>
        <hr className="h-1 bg-gray-700 mt-3 mb-6"/>

        {/* === MAIN CONTENT ROW === */}
        <div className="flex justify-between items-start gap-8">

          {/* LEFT TEXT BLOCK */}
          <div className="flex-1 text-xl text-gray-700 leading-relaxed space-y-8">
            <p>
              To ensure the highest level of security and authenticity, we require you to complete a brief verification challenge. Please carefully follow the instructions provided in each CAPTCHA. Keep in mind that these instructions may vary slightly, so read them thoroughly before making your selection.
            </p>
            <p>
              For security reasons, all verifications are processed manually by our dedicated team. This may take some time, as our staff is currently handling a high volume of requests. We appreciate your patience and ask that you refrain from refreshing the page excessively—though, of course, that wouldn't make the process any faster.
            </p>
            <p>
              Thank you for your cooperation in maintaining the integrity of our system. Your compliance is greatly valued.
            </p>
          </div>

          {/* RIGHT CAPTCHA BLOCK */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-2 border border-gray-300">
            {captchaData && (
              <>
                <div className="bg-[#5b94df] rounded-t-lg p-6 mb-2">
                  <p className="text-xl font-semibold text-white">
                    {captchaData.text}
                  </p>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {captchaData.images.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => handleImageClick(image.id)}
                      className={`aspect-square bg-gray-300 cursor-pointer border-4 transition-all overflow-hidden ${
                        selectedImages.includes(image.id)
                          ? 'border-blue-600 shadow-lg'
                          : 'border-transparent hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src={image.url} 
                        alt={`Captcha option ${image.id + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {message && (
                  <div className={`p-3 rounded-lg mb-3 text-sm ${
                    message.includes('✓')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={selectedImages.length === 0}
                    className="flex-1 bg-[#5b94df] hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-bl-lg transition-colors text-md"
                  >
                    Verify
                  </button>
                  <button
                    onClick={handleReload}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-br-lg transition-colors text-md"
                  >
                    Reload
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </GameLayout>
  );
};

export default CaptchaTask;
