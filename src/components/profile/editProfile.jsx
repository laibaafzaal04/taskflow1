import React, { useState } from 'react';
import { X, User, Lock } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function EditProfile({ onClose }) {
  const { isDark } = useTheme();
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({ name: user.name, password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // Only include password if user entered something
    const payload = { name: formData.name };
    if (formData.password?.trim()) {
      payload.password = formData.password.trim();
    }

    const { data } = await API.put('/users/profile', payload);
    setUser(data);
    onClose();
  } catch (err) {
    const serverMsg = err.response?.data?.message || 'Failed to update profile';
    setError(serverMsg);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl transform transition-all duration-300 animate-slideUp ${
        isDark ? 'bg-slate-900/95 border border-yellow-900/30 text-white' : 'bg-white/95 border border-yellow-200 text-gray-900'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors hover:bg-gray-200/20 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Full Name"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700 placeholder-slate-400 focus:border-yellow-500' 
                  : 'bg-white border-amber-200 placeholder-gray-400 focus:border-amber-400'
              }`}
            />
          </div>

          <div className="relative">
            <Lock className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="New Password (optional)"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700 placeholder-slate-400 focus:border-yellow-500' 
                  : 'bg-white border-amber-200 placeholder-gray-400 focus:border-amber-400'
              }`}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-4">
            <button 
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 ${
                isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 disabled:opacity-60 ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/40'
              }`}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}