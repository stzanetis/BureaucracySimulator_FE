import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import api from '../services/api';

const EndScreen = () => {
    const navigate = useNavigate();
    const { elapsedTime, resetGame, nickname, formatTimeInSeconds } = useGame();
    const [percentile, setPercentile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const submitScore = async () => {
            const finalTimeSeconds = formatTimeInSeconds(elapsedTime);
            
            try {
                const data = await api.postEndscreen(finalTimeSeconds, nickname);
                setPercentile(data?.percentile || 50);
            } catch (error) {
                console.error('Error submitting score:', error);
                setPercentile(50);
            } finally {
                setLoading(false);
            }
        };

        submitScore();
    }, [elapsedTime, nickname, formatTimeInSeconds]);


    const handleViewLeaderboard = () => {
        navigate('/leaderboard');
    };

    const handleReturnToStart = () => {
        resetGame();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-300 flex items-center justify-center">
                <div className="text-2xl text-gray-700">Calculating results...</div>
            </div>
        );
    }

    const formattedScore = (elapsedTime / 60).toFixed(2); 
    const displayPercentile = 100 - percentile; 

    return (
        <div className="min-h-screen bg-[#a1c6ea] flex items-center justify-center p-4">
            <div className="max-w-xl h-[800px] w-full bg-[#c7ddf2] rounded-3xl shadow-2xl p-8 flex flex-col items-center">
                
                {/* Logo */}
                <div className="flex justify-center mb-16 mt-16">
                    <img src="/Logo.png" alt="Bureaucracy Simulator" className="h-48 object-contain" />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-center text-[#003476] font-cursive mb-6">
                    Congratulations
                </h1>
                <h2 className="text-4xl font-bold text-center text-[#003476] font-cursive mb-12">
                    you made it!
                </h2>

                {/* Statistics Message */}
                <div className="text-center text-gray-700 text-lg leading-relaxed mb-16">
                    Your score of <span className="text-[#003476] font-bold">{formattedScore}</span> places you in the top <span className="text-[#003476] font-bold">{displayPercentile}%</span> of players.
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 w-64 mt-auto mb-16"> 
                    
                    {/* View Leaderboard */}
                    <button
                        onClick={handleViewLeaderboard}
                        className="w-full bg-[#3c763d] hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        View the Leaderboard
                    </button>
                    
                    {/* Return to Start - Κρατάμε αυτό ως Play Again/Start New Game */}
                    
                </div>
            </div>
        </div>
    );
};

export default EndScreen;