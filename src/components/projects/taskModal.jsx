import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import DatePicker from '../shared/datePicker';
import socket from '../../utils/socket';

export default function TaskModal({ task, defaultStatus = 'todo', onClose, onSuccess }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    priority: 'medium',
    status: defaultStatus,
    dueDate: ''
  });

  useEffect(() => {
    fetchProjects();
    if (user.role === 'admin') fetchMembers();
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || task.project || '',
        assignee: task.assignee?._id || task.assignee || '',
        priority: task.priority || 'medium',
        status: task.status || defaultStatus,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
      setComments(task.comments || []);
    }
  }, [task]);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data } = await API.get('/users');
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDateSelect = (dateStr) => {
    setFormData({ ...formData, dueDate: dateStr });
    setShowDatePicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) { setError('Title is required'); return; }
    if (!formData.project) { setError('Please select a project'); return; }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project: formData.project,
        priority: formData.priority,
        status: formData.status,
        assignee: formData.assignee || null,
        dueDate: formData.dueDate || null
      };

      let responseData;
      if (task) {
        const { data } = await API.put(`/tasks/${task._id}`, payload);
        responseData = data;
      } else {
        const { data } = await API.post('/tasks', payload);
        responseData = data;
      }

      socket.emit('taskUpdate', { projectId: formData.project, task: responseData });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Task save error:', err);
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;
    try {
      const { data } = await API.post(`/tasks/${task._id}/comment`, { text: newComment });
      socket.emit('newComment', { projectId: task.project?._id || task.project, task: data });
      setComments(data.comments);
      setNewComment('');
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  // Fix: use if-block — e.preventDefault() returns undefined (falsy),
  // so chaining with && would prevent handleAddComment from ever running
  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddComment();
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all ${
    isDark
      ? 'bg-slate-800/60 border-slate-700 text-white placeholder-slate-400 focus:border-yellow-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-yellow-400'
  }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl shadow-yellow-500/20 ${
        isDark ? 'bg-slate-900/95 border border-yellow-900/30' : 'bg-white/95 border border-yellow-200'
      }`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <button onClick={onClose} className={`p-2 rounded-full hover:bg-gray-200/20 ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Title *</label>
              <input name="title" value={formData.title} onChange={handleChange} required placeholder="Task title..." className={inputClass} />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Details..." className={`${inputClass} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Project *</label>
                <select name="project" value={formData.project} onChange={handleChange} required className={`${inputClass} appearance-none`}>
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className={`${inputClass} appearance-none`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={`${inputClass} appearance-none`}>
                  <option value="todo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="relative">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Due Date</label>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`${inputClass} flex items-center justify-between`}
                >
                  <span>{formData.dueDate ? new Date(formData.dueDate + 'T00:00:00').toLocaleDateString() : 'Select date'}</span>
                  <Calendar className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
                </button>
                {showDatePicker && (
                  <div className="absolute z-20 mt-2">
                    <DatePicker selectedDate={formData.dueDate} onDateSelect={handleDateSelect} onClose={() => setShowDatePicker(false)} />
                  </div>
                )}
              </div>
            </div>

            {user.role === 'admin' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Assign to</label>
                <select name="assignee" value={formData.assignee} onChange={handleChange} className={`${inputClass} appearance-none`}>
                  <option value="">Unassigned</option>
                  {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.role})</option>)}
                </select>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 p-3 rounded-xl">{error}</p>
            )}

            {task && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Comments</label>
                <div className="space-y-3 mb-3 max-h-36 overflow-y-auto">
                  {comments.length === 0 && (
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>No comments yet.</p>
                  )}
                  {comments.map((comment, i) => (
                    <div key={i} className="text-sm">
                      <span className={`font-medium mr-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{comment.user?.name || 'Unknown'}</span>
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{new Date(comment.createdAt).toLocaleString()}</span>
                      <p className={`mt-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{comment.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={handleCommentKeyDown}
                    placeholder="Add comment..."
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className={`px-5 py-3 rounded-xl font-medium transition-all ${!newComment.trim() ? 'bg-gray-500 cursor-not-allowed text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-white'}`}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-2">
              <button type="button" onClick={onClose} className={`px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 disabled:opacity-60 ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/40'}`}
              >
                {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}