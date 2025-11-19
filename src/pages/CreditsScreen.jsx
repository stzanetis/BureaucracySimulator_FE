import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreditsScreen = () => {
  const navigate = useNavigate();
  const [aboutUsText, setAboutUsText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        const data = await api.getAboutUs();
        setAboutUsText(data.paragraph || '');
      } catch (error) {
        console.error('Error fetching about us:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutUs();
  }, []);

  return (
    <div className="min-h-screen bg-[#a1c6ea] flex items-center justify-center p-4">
      <div className="max-w-xl h-[800px] w-full bg-[#c7ddf2] rounded-3xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-white text-shadow-md mb-8">About Us</h1>
        
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <div className="mb-8">
            <p className="text-gray-700 text-center text-lg leading-relaxed whitespace-pre-line">
              {aboutUsText || 'Welcome to Bureaucracy Simulator!'}
            </p>
          </div>
        )}

        <div className="flex justify-center mb-4 mt-[360px]">
          <button
            onClick={() => navigate('/')}
            className="bg-[#003476] hover:bg-blue-800 text-white py-4 px-24 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsScreen;
