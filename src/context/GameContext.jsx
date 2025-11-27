import { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error('useGame must be used within a GameProvider');
	}
	return context;
};

export const GameProvider = ({ children }) => {
  const [nickname, setNickname] = useState('');
  const [seed, setSeed] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [songList, setSongList] = useState([]);
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('Welcome!');
  const [shuffledDepartments, setShuffledDepartments] = useState([]);
	
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

	const endGame = () => {
		setIsGameActive(false);
	};

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

	const updateTaskStatus = (taskId, completed) => {
		setTasks(prevTasks =>
			prevTasks.map(task =>
				task.id === taskId ? { ...task, completed } : task
			)
		);
	};

	const toggleMusic = () => {
		setIsMusicOn(prev => !prev);
	};

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const formatTimeInSeconds = (seconds) => {
		return seconds;
	};

	const startTimer = () => {
		setIsGameActive(true);
	};

  const allTasksCompleted = () => {
    return tasks.length > 0 && tasks.every(task => task.completed);
  };  
	
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