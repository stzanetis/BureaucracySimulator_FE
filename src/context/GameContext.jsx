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

  // Timer effect
  useEffect(() => {
    let interval;
    if (isGameActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive]);

  const startGame = (playerNickname, taskList) => {
    setNickname(playerNickname);
    setTasks(taskList);
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
    startGame,
    startTimer,
    endGame,
    resetGame,
    updateTaskStatus,
    toggleMusic,
    formatTime,
    allTasksCompleted
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
