import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USERNAME = import.meta.env.VITE_API_USERNAME;
const PASSWORD = import.meta.env.VITE_API_PASSWORD;

// Create axios instance with basic auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  auth: {
    username: USERNAME,
    password: PASSWORD
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// API service methods
// Backend returns: { success, data, error, message }
// We extract the .data property which contains the actual response data
const api = {
  // GET /startscreen/ - Get list of song URLs
  getStartscreen: async () => {
    const response = await apiClient.get('/startscreen/');
    return response.data.data; // Extract data from { success, data, error, message }
  },

  // GET /leaderboard/ - Get leaderboard data
  getLeaderboard: async () => {
    const response = await apiClient.get('/leaderboard/');
    return response.data.data;
  },

  // GET /about-us/ - Get About Us paragraph
  getAboutUs: async () => {
    const response = await apiClient.get('/about-us/');
    return response.data.data;
  },

  // GET /endscreen/ - Retrieve statistics for user attempt
  getEndscreen: async () => {
    const response = await apiClient.get('/endscreen/');
    return response.data.data;
  },

  // POST /endscreen/ - Submit statistics for user attempt
  postEndscreen: async (elapsedTime, nickname = 'Anonymous') => {
    const response = await apiClient.post(`/endscreen/?nickname=${encodeURIComponent(nickname)}`, { elapsedTime });
    console.log(response.data);
    return response.data.data;
  },

  // POST /user/ - Submit nickname and seed to get to-do list
  postUser: async (nickname, seed) => {
    const response = await apiClient.post('/user/', { nickname, seed });
    return response.data.data; // Returns { toDoList, chatbotMessages }
  },

  // PUT /user/homescreen/tasks/{taskID} - Submit user input for a specific task
  putTaskCheck: async (taskID, userInput) => {
    const response = await apiClient.put(`/user/homescreen/tasks/${taskID}`, { userInput });
    return response.data.data;
  },

  // GET /user/homescreen/todolist - Retrieve updated task list
  getTodoList: async () => {
    const response = await apiClient.get('/user/homescreen/todolist');
    return response.data.data;
  },

  // GET /user/homescreen/tasks/{taskID}/ - Get a specific task
  getTaskById: async (taskID) => {
    const actualTaskID = taskID === '0' ? '4' : taskID;
    const response = await apiClient.get(`/user/homescreen/tasks/${actualTaskID}/`);
    return response.data.data;
  },

  // GET /user/homescreen/tasks/9/payment-portal/ - Get payment status for coffee task
  getTaskPaymentStatus: async () => {
    const response = await apiClient.get('/user/homescreen/tasks/9/payment-portal/');
    return response.data.data;
  },

  //FORM TASK: PUT /user/homescreen/tasks/{taskID}/form-check - Submit user input
  putFormTaskCheck: async (taskID, userInput) => {
    const response = await apiClient.put(`/user/homescreen/tasks/${taskID}/form-check`, { userInput });
    return response.data.data;
  },

  // FORM TASK: GET /user/homescreen/tasks/{taskID}/form - Get form data
  getFormTask: async (taskID) => {
    const actualTaskID = taskID === '0' ? '2' : taskID;
    const response = await apiClient.get(`/user/homescreen/tasks/${actualTaskID}/form`);
    return response.data.data;
  },

  //PUZZLE TASK: PUT /user/homescreen/tasks/{taskID}/puzzle-check - Submit user input
  putPuzzleTaskCheck: async (taskID, userInput) => {
    const response = await apiClient.put(`/user/homescreen/tasks/${taskID}/puzzle-check`, userInput );
    return response.data.data;
  },

  // PUZZLE TASK: GET /user/homescreen/tasks/{taskID}/puzzle - Get puzzle data
  getPuzzleTask: async (taskID) => {
    const actualTaskID = taskID === '0' ? '6' : taskID;
    const response = await apiClient.get(`/user/homescreen/tasks/${actualTaskID}/puzzle`);
    return response.data.data;
  }
};

export default api;
