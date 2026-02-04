import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import API from '../../services/api';

export default function ProjectModal({ project, onClose, onSuccess }) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
    status: 'active',
    progress: 0
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        color: project.color || 'blue',
        status: project.status || 'active',
        progress: project.progress || 0
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'progress') {
      setFormData({ ...formData, progress: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Don't send progress in the update - let backend calculate it
      const { progress, ...dataToSend } = formData;
      
      if (project) {
        await API.put(`/projects/${project._id}`, dataToSend);
      } else {
        await API.post('/projects', dataToSend);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert(error.response?.data?.message || 'Error saving project');
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { value: 'blue', class: 'bg-blue-500' },
    { value: 'purple', class: 'bg-purple-500' },
    { value: 'green', class: 'bg-green-500' },
    { value: 'red', class: 'bg-red-500' },
    { value: 'yellow', class: 'bg-amber-500' },
    { value: 'pink', class: 'bg-pink-500' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-black/50'} backdrop-blur-md`}
        onClick={onClose}
      />

      {/* Modal Container with padding for close button */}
      <div className="relative w-full max-w-lg my-auto max-h-[calc(100vh-4rem)] flex flex-col">
        {/* Close Button - Outside top right */}
        <button 
          onClick={onClose}
          className={`
            absolute -top-14 right-0 z-50 w-12 h-12 rounded-full 
            flex items-center justify-center shadow-2xl transition-all hover:scale-110
            ${isDark
              ? 'bg-yellow-500 hover:bg-yellow-400 text-white hover:shadow-yellow-500/50'
              : 'bg-yellow-500 hover:bg-yellow-400 text-white hover:shadow-yellow-500/50'
            }
          `}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal - Scrollable */}
        <div 
          className={`
            rounded-3xl shadow-2xl border overflow-y-auto
            transform transition-all duration-300 animate-slideUp
            ${isDark 
              ? 'bg-slate-900/95 border-yellow-500/20' 
              : 'bg-white/95 border-yellow-400/30'
            }
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-8 pt-12">
            <h2 className={`text-2xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {project ? 'Edit Project' : 'Create New Project'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'bg-slate-800/70 border-slate-600 text-white focus:border-yellow-500/60'
                      : 'bg-white/80 border-gray-300 text-gray-900 focus:border-yellow-400/60'
                  }`}
                  placeholder="Enter project name"
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
                  placeholder="Brief description (optional)"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                  Project Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`
                        w-12 h-12 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg
                        ${formData.color === color.value 
                          ? 'ring-4 ring-offset-2 ring-yellow-500 scale-110 shadow-lg shadow-yellow-500/40' 
                          : 'ring-2 ring-yellow-400/30 hover:ring-yellow-400/50'
                        }
                        ${color.class}
                      `}
                    />
                  ))}
                </div>
              </div>

              {/* Progress - Read Only (Auto-calculated) */}
              {project && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                    Progress <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>(Auto-calculated from tasks)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-700/50' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full bg-yellow-500 transition-all duration-500"
                          style={{ width: `${formData.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className={`font-bold text-xl min-w-[4rem] text-center ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {formData.progress}%
                    </span>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all appearance-none ${
                    isDark
                      ? 'bg-slate-800/70 border-slate-600 text-white focus:border-yellow-500/60'
                      : 'bg-white/80 border-gray-300 text-gray-900 focus:border-yellow-400/60'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Action Buttons */}
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
                  {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
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