import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const GameLayout = ({ children }) => {
  const navigate = useNavigate();
  const { tasks, elapsedTime, formatTime, allTasksCompleted, endGame } = useGame();

  // All departments from backend
  const departments = [
    { id: 1, name: 'Secretary of Bored and Shady Individuals', pageName: 'puzzle-task', taskType: 'PUZZLE' },
    { id: 2, name: 'Department of Unreadable Forms', pageName: 'form-task', taskType: 'FORM' },
    { id: 3, name: 'CAPTCHA Complaints Unit', pageName: 'captcha-task', taskType: 'CAPTCHA' },
    { id: 4, name: 'Secretariat of Drowsiness', pageName: 'coffee-task', taskType: 'COFFEE' },
    { id: 5, name: 'Serious Headquarters of Seriousness', pageName: 'signature-task', taskType: 'SIGNATURE' },
    { id: 6, name: 'Unjustified Audit Office', pageName: 'display-task', taskType: 'DISPLAY' }
  ];

  const handleDepartmentClick = (department) => {
    // Find if user has a task for this department
    const userTask = tasks?.find(task => task.pageName === department.pageName);
    
    // User has this task, navigate to it
    const routes = {
        'CAPTCHA': `/game/task/captcha/${userTask.id}`,
        'FORM': `/game/task/form/${userTask.id}`,
        'PUZZLE': `/game/task/puzzle/${userTask.id}`,
        'COFFEE': `/game/task/coffee/${userTask.id}`,
        'SIGNATURE': `/game/task/signature/${userTask.id}`,
        'DISPLAY': `/game/task/display/${userTask.id}`,
        'MISC': `/game/task/generic/${userTask.id}`
    };
    navigate(routes[userTask.taskType] || `/game/task/generic/${userTask.id}`);
  };

  const handleFinish = () => {
    if (allTasksCompleted()) {
      endGame();
      navigate('/end');
    } else {
      alert('Please complete all tasks before finishing!');
    }
  };

  const handleHomeClick = () => {
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Departments */}
      <div className="w-80 bg-[#003476] text-white px-4 py-6 flex flex-col shadow-xl">
        <button 
          onClick={handleHomeClick}
          className="text-xl bg-[#32746d] hover:bg-[#3d8a81] font-bold shadow-lg rounded-lg h-16 mb-6 transition-colors"
        >
          Home
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {departments.map((dept) => {
            return (
              <button
                key={dept.id}
                onClick={() => handleDepartmentClick(dept)}
                className='w-full text-left p-3 rounded-lg transition-all'
              >
                <div className="font-medium text-sm">{dept.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {children}
      </div>

      {/* Right Sidebar - Timer and To-Do List */}
      <div className="w-96 p-6 flex flex-col">
        {/* Timer Widget */}
        <div className="bg-[#32746d] text-white rounded-xl shadow-lg p-5 mb-6">
          <div className="text-sm text-gray-200 mb-2">Elapsed Time</div>
          <div className="text-4xl font-bold">
            {typeof formatTime === 'function' ? formatTime(elapsedTime) : '00:00'}
          </div>
        </div>

        {/* Chat Widget */}
        <div className="bg-[#a1c6ea] text-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-4 bg-[#8ab4db] flex justify-center">
            <img className="h-16" src="/Logo.png" alt="Logo" />
          </div>
          <div className="m-4 rounded-xl font-medium text-black bg-white p-4 min-h-[6rem] flex items-center justify-center shadow-inner">
            <div className="text-sm text-center leading-relaxed">
              Welcome! Complete all your assigned tasks.
            </div>
          </div>
        </div>

        {/* To-Do List */}
        <div className="bg-[#003476] rounded-xl shadow-lg p-5 overflow-auto flex flex-col max-h-[60vh]">
          <h3 className="text-lg font-bold text-white mb-4">Your To-Do List</h3>
          {tasks && Array.isArray(tasks) && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`p-2 rounded-lg border-2 ${
                    task.completed
                      ? 'bg-green-50 border-green-400'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        Task {index + 1}: {task.taskType}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {task.pageName?.replace(/-/g, ' ')}
                      </div>
                    </div>
                    <div className="ml-3">
                      {task.completed ? (
                        <span className="text-green-600 font-bold text-xl">✓</span>
                      ) : (
                        <span className="text-gray-400 font-bold text-xl">○</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
                <button
                    onClick={handleFinish}
                    disabled={!allTasksCompleted()}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                        allTasksCompleted()
                        ? 'bg-green-600 hover:bg-green-700 shadow-lg'
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                >
                    Finish
                </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No tasks assigned
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
