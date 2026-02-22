import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/themeContext';
import API from '../../services/api';
import TaskCard from '../projects/taskCard';
import { ClipboardList } from 'lucide-react';

export default function MyTasks() {
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/tasks?assignee=true');
      setTasks(data);
    } catch (err) {
      console.error('MyTasks fetch error:', err);
      setError('Failed to load your tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-slate-800/40 text-red-400' : 'bg-white text-red-500'}`}>
        <p>{error}</p>
        <button
          onClick={fetchMyTasks}
          className="mt-4 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-white font-medium transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed ${
        isDark ? 'border-slate-600 text-slate-400' : 'border-gray-300 text-gray-500'
      }`}>
        <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-lg font-medium">No tasks assigned to you</p>
        <p className="text-sm mt-1 opacity-70">Tasks assigned to you will appear here</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {tasks.map(task => (
        <TaskCard key={task._id} task={task} onUpdate={fetchMyTasks} />
      ))}
    </div>
  );
}