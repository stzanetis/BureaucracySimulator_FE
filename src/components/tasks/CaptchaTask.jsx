import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import GameLayout from '../GameLayout';
import api from '../../services/api';

const CaptchaTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();
  const [captchaData, setCaptchaData] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const data = await api.getTaskById(taskId);
      // Backend should return CAPTCHA data structure
      setCaptchaData(data);
      setSelectedImages([]);
      setMessage('');
    } catch (error) {
      console.error('Error fetching CAPTCHA:', error);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImages(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleReload = () => {
    const newReloadCount = reloadCount + 1;
    setReloadCount(newReloadCount);
    
    // Easter egg: reload 3 times completes the task
    if (newReloadCount >= 3) {
      handleComplete();
      return;
    }
    
    fetchCaptcha();
  };

  const handleSubmit = async () => {
    try {
      const response = await api.putTaskCheck(taskId, { selectedImages });
      
      if (response.isTaskCompleted) {
        handleComplete();
      } else {
        setMessage('Incorrect! Please try again.');
        fetchCaptcha();
      }
    } catch (error) {
      console.error('Error submitting CAPTCHA:', error);
      setMessage('Error submitting. Please try again.');
    }
  };

  const handleComplete = () => {
    updateTaskStatus(parseInt(taskId), true);
    setMessage('✓ Task Completed!');
    setTimeout(() => navigate('/game'), 2000);
  };

  return (
    <GameLayout>
      <div className="p-8">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">CAPTCHA Verification</h1>
          <p className="text-gray-600 mb-6">
            Select all images that match the description below:
          </p>

          {captchaData && (
            <>
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
                <p className="text-lg font-semibold text-blue-900">
                  Select all images containing: <span className="text-blue-600">Traffic Lights</span>
                </p>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className={`aspect-square bg-gray-300 rounded-lg cursor-pointer border-4 transition-all ${
                      selectedImages.includes(index)
                        ? 'border-blue-600 shadow-lg'
                        : 'border-transparent hover:border-gray-400'
                    } flex items-center justify-center text-gray-500`}
                  >
                    Image {index + 1}
                  </div>
                ))}
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
                  onClick={handleSubmit}
                  disabled={selectedImages.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Submit
                </button>
                <button
                  onClick={handleReload}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  🔄 Reload
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </GameLayout>
  );
};

export default CaptchaTask;
