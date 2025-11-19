import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import GameLayout from '../GameLayout';
import api from '../../services/api';

const FormTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    purpose: '',
    address: '',
    signature: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    const allFilled = Object.values(formData).every(val => val.trim() !== '');
    if (!allFilled) {
      setMessage('Please fill out all fields!');
      return;
    }

    try {
      const response = await api.putTaskCheck(taskId, formData);
      
      if (response.isTaskCompleted) {
        updateTaskStatus(parseInt(taskId), true);
        setMessage('✓ Form accepted! Task completed!');
        setTimeout(() => navigate('/game'), 2000);
      } else {
        setMessage('It seems like the form is filled out incorrectly. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Error submitting form. Please try again.');
    }
  };

  return (
    <GameLayout>
      <div className="p-8">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Official Form 27B-6</h1>
        <p className="text-gray-600 mb-6">Please complete this form with accurate information.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Full Legal Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500"
              placeholder="First Middle Last"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Identification Number *
            </label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500"
              placeholder="000-000-0000"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Purpose of Request *
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a purpose...</option>
              <option value="personal">Personal Use</option>
              <option value="business">Business Use</option>
              <option value="official">Official Use</option>
              <option value="other">Other (Please Specify in Address)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Residential Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500"
              placeholder="Street, City, State, ZIP"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Signature (Type your name) *
            </label>
            <input
              type="text"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500 font-cursive italic"
              placeholder="Your signature"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('✓')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Submit Form
          </button>
        </form>
        </div>
      </div>
    </GameLayout>
  );
};

export default FormTask;
