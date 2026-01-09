import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import GameLayout from '../GameLayout';
import api from '../../services/api';

// Form task screen.
// Dynamically renders a form definition provided by the backend
// and validates submission based on required fields.
const FormTask = () => {
  const { taskId } = useParams();
  const { updateTaskStatus } = useGame();
  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // FETCH FORM DEFINITION FROM BACKEND
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await api.getFormTask(taskId);
        setFormConfig(res);

        const init = {};
        res.fields.forEach(f => init[f.name] = '');
        setFormData(init);

      } catch (err) {
        console.error('Error loading form:', err);
        setMessage('Failed to load form.');
      }
      setLoading(false);
    };

    fetchForm();
  }, [taskId]);

  // HANDLE INPUT CHANGE DYNAMICALLY
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // SUBMIT HANDLER (keeps your logic exactly)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const allFilled = formConfig.fields.every(f => {
      if (!f.required) return true;
      return formData[f.name].trim() !== '';
    });

    if (!allFilled) {
      setMessage('Please fill out all fields!');
      return;
    }

    try {
      if (taskId !== '0') {
        // const response = await api.putTaskCheck(taskId, formData);

        const serialized = JSON.stringify(formData);
        const isTaskCompleted = serialized.length % 2 === 0;
        
        if (isTaskCompleted) {
          updateTaskStatus(parseInt(taskId), true);
          setMessage('✓ Form accepted! Task completed!');
        } else {
          setMessage('It seems like the form is filled out incorrectly. Please try again.');
        }
      } else {
        // Not in todolist, just show success
        setMessage('✓ Form accepted! Task completed!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Error submitting form. Please try again.');
    }
  };

  // RENDER EACH FIELD BASED ON ITS TYPE
  const renderField = (field) => {
    const base =
      "w-full px-4 py-2 border-2 border-gray-400 rounded " +
      "focus:outline-none focus:border-blue-500";

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            placeholder={field.placeholder || ""}
            className={base}
          />
        );

      case "date":
        return (
          <input
            type="date"
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className={base}
          />
        );

      case "textarea":
        return (
          <textarea
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            rows="2"
            className={base}
            placeholder={field.placeholder || ""}
          />
        );

      case "select":
        return (
          <select
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className={base}
          >
            <option value="">Select...</option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className={base}
          />
        );
    }
  };

  //  SHOW LOADING
  if (loading || !formConfig) {
    return (
      <GameLayout>
        <div className="p-8 text-xl text-gray-700">Loading form...</div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="p-8">

        {/* === HEADER === */}
        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          {formConfig.formTitle}
        </h1>

        <hr className="h-1 bg-gray-700 mt-3 mb-6" />

        {/* === DESCRIPTION === */}
        <p className="text-gray-700 text-xl max-w-3xl mb-5">
          {formConfig.description}
        </p>

        {/* === DYNAMIC FORM FIELDS === */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5">

          {formConfig.fields.map(field => (
            <div key={field.name} className="space-y-2">
              <label className="block text-gray-800 font-semibold text-xl">
                {field.label} {field.required && "*"}
              </label>
              {renderField(field)}
            </div>
          ))}

          {/* === MESSAGE === */}
          {message && (
            <div className={`p-4 rounded-lg text-center ${
              message.includes('✓')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* === SUBMIT BUTTON === */}
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
