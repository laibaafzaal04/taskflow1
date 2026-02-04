import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import DatePicker from '../shared/datePicker';

export default function TaskModal({ task, onClose, onSuccess }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    priority: 'medium',
    status: 'todo',
    dueDate: ''
  });

  useEffect(() => {
    fetchProjects();
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
      setComments(task.comments || []);
    } else {
      setComments([]);
    }
  }, [task]);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (dateString) => {
    setFormData({ ...formData, dueDate: dateString });
    setShowDatePicker(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { data } = await API.post(`/tasks/${task._id}/comment`, { text: newComment });
      setComments(data.comments || []);
      setNewComment('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Could not add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, assignee: user._id, createdBy: user._id };
      if (task) {
        await API.put(`/tasks/${task._id}`, payload);
      } else {
        await API.post('/tasks', payload);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto animate-fadeIn">
      <div
        className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-black/50'} backdrop-blur-md`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border transform transition-all duration-300 animate-slideUp ${
          isDark
            ? 'bg-slate-900/95 border-yellow-500/20'
            : 'bg-white/95 border-yellow-400/30'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute -top-12 right-0 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 ${
            isDark
              ? 'bg-yellow-500 text-white hover:bg-yellow-400 hover:shadow-yellow-500/50'
              : 'bg-yellow-500 text-white hover:bg-yellow-400 hover:shadow-yellow-500/50'
          }`}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 pt-12">
          <h2 className={`text-2xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                  isDark
                    ? 'bg-slate-800/70 border-slate-600 text-white focus:border-yellow-500/60'
                    : 'bg-white/80 border-gray-300 text-gray-900 focus:border-yellow-400/60'
                }`}
                placeholder="Enter task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all resize-none ${
                  isDark
                    ? 'bg-slate-800/70 border-slate-600 text-white focus:border-yellow-500/60'
                    : 'bg-white/80 border-gray-300 text-gray-900 focus:border-yellow-400/60'
                }`}
                placeholder="Enter task description"
              />
            </div>

            {/* Comments Section - Only shown for existing tasks */}
            {task && (
              <div className="mt-6">
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                  Comments ({comments.length})
                </label>

                <div
                  className={`max-h-48 overflow-y-auto mb-4 p-4 rounded-xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {comments.length === 0 ? (
                    <p className={`text-sm text-center py-6 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    comments.map((comment, index) => (
                      <div key={index} className="mb-4 pb-4 border-b last:border-b-0 last:mb-0">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {comment.user?.name || 'Unknown User'}
                              </p>
                              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                                {new Date(comment.createdAt).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-yellow-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-yellow-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || loading}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      loading || !newComment.trim()
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-yellow-500 hover:bg-yellow-400 text-white hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105'
                    }`}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}

            {/* Project */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                Project *
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border-2 appearance-none transition-all ${
                  isDark
                    ? 'bg-slate-800/70 border-slate-600 text-white focus:border-yellow-500/60'
                    : 'bg-white/80 border-gray-300 text-gray-900 focus:border-yellow-400/60'
                }`}
              >
                <option value="">Select project</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'bg-slate-800/70 border-slate-600 text-white focus:border-yellow-500/60'
                      : 'bg-white/80 border-gray-300 text-gray-900 focus:border-yellow-400/60'
                  }`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'bg-slate-800/70 border-slate-600 text-white focus:border-yellow-500/60'
                      : 'bg-white/80 border-gray-300 text-gray-900 focus:border-yellow-400/60'
                  }`}
                >
                  <option value="todo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="relative">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                Due Date
              </label>
              <div
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`flex items-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  isDark
                    ? 'bg-slate-800/70 border-slate-600 text-white hover:border-yellow-500/60'
                    : 'bg-white/80 border-gray-300 text-gray-900 hover:border-yellow-400/60'
                }`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span>
                  {formData.dueDate
                    ? new Date(formData.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Select due date'}
                </span>
              </div>
              {showDatePicker && (
                <DatePicker
                  selectedDate={formData.dueDate}
                  onDateSelect={handleDateChange}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-8">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all hover:scale-105 ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 rounded-xl text-white font-bold transition-all hover:scale-105 disabled:opacity-60 ${
                  loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/40'
                }`}
              >
                {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}