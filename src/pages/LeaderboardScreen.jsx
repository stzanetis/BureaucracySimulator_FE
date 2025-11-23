import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LeaderboardScreen = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getLeaderboard();
        setLeaderboardData(data.leaderboard || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#a1c6ea] flex items-center justify-center p-4">
      <div className="max-w-xl h-[800px] w-full bg-[#c7ddf2] rounded-3xl shadow-2xl p-8 flex flex-col">
        <h1 className="text-5xl text-shadow-md text-center text-white mb-8 font-cursive">Leaderboard</h1>
        
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <div className="space-y-3 mb-8">
            {leaderboardData.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-white/40 rounded-lg"
              >
                <span className="font-semibold text-gray-800 text-lg">
                  {index + 1}. {entry.name}
                </span>
                <span className="text-[#003476] font-bold text-xl">{entry.score}</span>
              </div>
            ))}
            {leaderboardData.length === 0 && (
              <p className="text-center text-gray-500 py-8">No entries yet!</p>
            )}
          </div>
        )}

        <div className="flex justify-center mt-auto">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#003476] hover:bg-blue-800 text-white py-4 px-24 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
