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

        {/* === HEADER === */}
        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          Official Form 27B-6
        </h1>

        <hr className="h-1 bg-gray-700 mt-3 mb-6" />

        {/* === OPTIONAL SUBTEXT (small description) === */}
        <p className="text-gray-700 text-xl max-w-3xl mb-5">
          Please complete this form with accurate information.
        </p>

        {/* === FORM FIELDS === */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5">

          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-semibold text-xl">
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

          {/* ID Number */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-semibold text-xl">
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

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-semibold text-xl">
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

          {/* Purpose */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-semibold text-xl">
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
              <option value="other">Other (Please Specify in Signature)</option>
            </select>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-semibold text-xl">
              Residential Address *
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500"
              placeholder="Street, City, State, ZIP"
            />
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-semibold text-xl">
              Signature (Type your name) *
            </label>
            <textarea
              type="text"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500 italic"
              placeholder="Your signature"
            />
          </div>

          {/* Message display */}
          {message && (
            <div className={`p-4 rounded-lg text-center ${
              message.includes('✓')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="px-10 py-3 bg-blue-700 text-white text-lg rounded-md hover:bg-blue-800 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </GameLayout>
  );
};

export default FormTask;
