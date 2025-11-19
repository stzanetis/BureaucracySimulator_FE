import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import api from '../services/api';
import {Star, Volume2, VolumeOff, User} from 'lucide-react';

const StartScreen = () => {
  const navigate = useNavigate();
  const { startGame, setSongList, isMusicOn, toggleMusic } = useGame();
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    // Fetch song list on mount
    const fetchSongs = async () => {
      try {
        const data = await api.getStartscreen();
        setSongList(data.songlist || []);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };
    fetchSongs();
  }, [setSongList]);

  const handlePlayClick = async () => {
    if (!nickname.trim()) {
      alert('Please enter a nickname!');
      return;
    }

    try {
      const seed = Math.floor(Math.random() * 10000);
      const taskList = await api.postUser(nickname, seed);
      startGame(nickname, taskList);
      navigate('/game');
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const handleLeaderboardClick = () => {
    navigate('/leaderboard');
  };

  const handleCreditsClick = () => {
    navigate('/credits');
  };

  return (
    <div className="min-h-screen bg-[#a1c6ea] flex items-center justify-center p-4">
      <div className="max-w-xl h-[800px] w-full bg-[#c7ddf2] rounded-3xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-16 mt-16">
          <img src="/Logo.png" alt="Bureaucracy Simulator" className="h-48 object-contain" />
        </div>

        {/* Nickname Input */}
        <div className="flex justify-center mb-4">
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="bg-white shadow-lg w-[450px] px-4 py-3 mb-2 rounded-xl"
            placeholder="Nickname..."
            maxLength={20}
          />
        </div>

        {/* Play Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handlePlayClick}
            className="bg-[#003476] hover:bg-blue-800 text-white py-4 px-32 rounded-xl"
          >
            Play
          </button>
        </div>

        <div className="flex justify-center mt-64">
          <div className="flex items-center gap-4">
            {/* Leaderboard */}
            <button
              onClick={handleLeaderboardClick}
              className="w-10 h-10 rounded-full bg-[#003476] hover:bg-blue-80 text-white flex items-center justify-center shadow-md"
              aria-label="Leaderboard"
            >
              <Star size={16} />
            </button>

            {/* Credits */}
            <button
              onClick={handleCreditsClick}
              className="w-10 h-10 rounded-full bg-[#003476] hover:bg-blue-80 text-white flex items-center justify-center shadow-md"
              aria-label="Credits"
            >
              <User size={16} />
            </button>

            {/* Music Toggle */}
            <button
              onClick={toggleMusic}
              className="w-10 h-10 rounded-full bg-[#003476] hover:bg-blue-80 text-white flex items-center justify-center shadow-md"
              aria-label="Toggle music"
            >
              {isMusicOn ? <Volume2 size={16} /> : <VolumeOff size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
