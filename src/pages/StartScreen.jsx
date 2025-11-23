import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import api from '../services/api';
import {Star, Volume2, VolumeOff, User} from 'lucide-react';

const StartScreen = () => {
    const navigate = useNavigate();
    const {startGame, setSongList, isMusicOn, toggleMusic } = useGame();
    const [nickname, setNickname] = useState('');
    const [respo, setRespo] = useState('');

    useEffect(() => {
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

  const handlePlayClick = async (e) => {
    e.preventDefault(); 
    
    if (!nickname.trim()) {
      alert('Please enter a nickname!');
      return;
    }

    try {
      const seed = Math.floor(Math.random() * 10000);
	    const response = await api.postUser(nickname, seed);
      const messages = (response.chatbotMessages || []).map(msg => msg.text);
      startGame(nickname, response.toDoList, messages);
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
				<div className="flex justify-center mb-16 mt-16">
					<img src="/Logo.png" alt="Bureaucracy Simulator" className="h-48 object-contain" />
				</div>

				<form onSubmit={handlePlayClick}>
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

					<div className="flex justify-center mb-4">
						<button
							type="submit" 
							className="bg-[#003476] hover:bg-blue-800 text-white py-4 px-32 rounded-xl"
						>Play
						</button>
					</div>
				</form>

				<div className="flex justify-center mt-64">
					<div className="flex items-center gap-4">
						<button
							onClick={handleLeaderboardClick}
							className="w-10 h-10 rounded-full bg-[#003476] hover:bg-blue-80 text-white flex items-center justify-center shadow-md"
						>
							<Star size={16} />
						</button>

						<button
							onClick={handleCreditsClick}
							className="w-10 h-10 rounded-full bg-[#003476] hover:bg-blue-80 text-white flex items-center justify-center shadow-md"
						>
							<User size={16} />
						</button>

						<button
							onClick={toggleMusic}
							className="w-10 h-10 rounded-full bg-[#003476] hover:bg-blue-80 text-white flex items-center justify-center shadow-md"
						>
							{isMusicOn ? <Volume2 size={16} /> : <VolumeOff size={16} />}
						</button>
					</div>
				</div>

        {respo && (
          <div className="mt-4 p-4 bg-white rounded-xl shadow-md">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(respo, null, 2)}
            </pre>
          </div>
        )}

			</div>
		</div>
	);
};

export default StartScreen;
