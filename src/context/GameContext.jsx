import { createContext, useContext, useState, useEffect } from 'react';

// Central game state shared across the application
const GameContext = createContext();

// Custom hook for accessing game state safely
export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error('useGame must be used within a GameProvider');
	}
	return context;
};

// Provides global game state and logic to all child components
export const GameProvider = ({ children }) => {
  // Core game state
  const [nickname, setNickname] = useState('');
  const [seed, setSeed] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  
  // Audio & UI-related state
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [songList, setSongList] = useState([]);

  // Chatbot / message system state
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('Welcome!');

  // Internal state placeholder for future extensions
  const [_, setShuffledDepartments] = useState([]);
	
  // Game timer: increments elapsed time while the game is active
	useEffect(() => {
    let interval;
    if (isGameActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive]);

  // Cycle chatbot messages every 8 seconds
  useEffect(() => {
    if (chatbotMessages.length === 0) return;
    
    const messageInterval = setInterval(() => {
      const randomMessage = chatbotMessages[Math.floor(Math.random() * chatbotMessages.length)];
      setCurrentMessage(randomMessage);
    }, 8000);

    return () => clearInterval(messageInterval);
  }, [chatbotMessages]);

  // Initialize a new game session
  const startGame = (playerNickname, taskList, messages = []) => {
    setNickname(playerNickname);
    setTasks(taskList);
    setChatbotMessages(messages);
    if (messages.length > 0) {
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
    setSeed(Math.floor(Math.random() * 10000));
    setElapsedTime(0);
    setIsGameActive(true);
  };

  // Stop the game timer without resetting state
	const endGame = () => {
		setIsGameActive(false);
	};

  // Fully reset game state to initial values
	const resetGame = () => {
		setNickname('');
		setSeed(null);
		setTasks([]);
		setElapsedTime(0);
		setIsGameActive(false);
		setChatbotMessages([]);
		setCurrentMessage('Welcome!');
		setShuffledDepartments([]);
	};

  // Update completion status of a single task
	const updateTaskStatus = (taskId, completed) => {
		setTasks(prevTasks =>
			prevTasks.map(task =>
				task.id === taskId ? { ...task, completed } : task
			)
		);
	};

  // Toggle background music on/off
	const toggleMusic = () => {
		setIsMusicOn(prev => !prev);
	};

  // Format elapsed time as MM:SS
	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

  // Return raw elapsed time in seconds
	const formatTimeInSeconds = (seconds) => {
		return seconds;
	};

  // Manually start the game timer
	const startTimer = () => {
		setIsGameActive(true);
	};

  // Check whether all tasks have been completed
  const allTasksCompleted = () => {
    return tasks.length > 0 && tasks.every(task => task.completed);
  };  
	
  // Public API exposed to consuming components
	const value = {
    nickname,
    setNickname,
    seed,
    setSeed,
    tasks,
    setTasks,
    elapsedTime,
    setElapsedTime,
    isGameActive,
    setIsGameActive,
    isMusicOn,
    setIsMusicOn,
    songList,
    setSongList,
    chatbotMessages,
    setChatbotMessages,
    currentMessage,
    setCurrentMessage,
    startGame,
    startTimer,
    endGame,
    resetGame,
    updateTaskStatus,
    toggleMusic,
    formatTime,
    formatTimeInSeconds,
    allTasksCompleted
  };
	return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};