import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/themeContext';
import { Zap, Mail, Lock, User, Sun, Moon, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    adminCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Trim all values
    const trimmed = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      role: formData.role,
      adminCode: formData.adminCode.trim()
    };

    // Validation – prevent sending bad data
    if (!trimmed.email) {
      setError('Email is required');
      return;
    }
    if (!trimmed.password) {
      setError('Password is required');
      return;
    }

    if (!isLogin) {
      if (!trimmed.name) {
        setError('Full name is required');
        return;
      }

      if (trimmed.role === 'admin' && !trimmed.adminCode) {
        setError('Admin security code is required');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(trimmed.email, trimmed.password);
        if (!res.success) throw new Error(res.message || 'Login failed');
      } else {
        // Build flat payload
        const payload = {
          name: trimmed.name,
          email: trimmed.email,
          password: trimmed.password,
          role: trimmed.role
        };

        if (trimmed.role === 'admin') {
          payload.adminCode = trimmed.adminCode;
        }

        console.log('Sending registration payload:', payload); // Debug – check browser console

        const res = await register(payload);
        if (!res.success) throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      // Show exact backend message if available
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-950 to-slate-900' 
        : 'bg-gradient-to-br from-amber-50 to-yellow-100'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-md transition-all duration-300 ${
        isDark 
          ? 'bg-slate-900/80 border border-yellow-900/20 shadow-yellow-500/10' 
          : 'bg-white/90 border border-yellow-200 shadow-yellow-300/30'
      }`}>
        <div className="flex justify-end mb-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200/20 transition-all"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-amber-600" />}
          </button>
        </div>

        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 mb-2 ${
            isDark ? 'text-yellow-400' : 'text-amber-600'
          }`}>
            <Zap className="w-10 h-10" />
            <h1 className="text-4xl font-bold">TaskFlow</h1>
          </div>
          <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              {/* Full Name */}
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
                      ? 'bg-slate-800/60 border-slate-700 text-white placeholder-slate-400 focus:border-yellow-500' 
                      : 'bg-white border-amber-200 text-gray-900 placeholder-gray-400 focus:border-amber-400'
                  }`}
                />
              </div>

              {/* Role Selection */}
              <div className="relative">
                <ShieldCheck className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border appearance-none transition-all ${
                    isDark 
                      ? 'bg-slate-800/60 border-slate-700 text-white focus:border-yellow-500' 
                      : 'bg-white border-amber-200 text-gray-900 focus:border-amber-400'
                  }`}
                >
                  <option value="member">Sign up as Member</option>
                  <option value="admin">Sign up as Admin</option>
                </select>
              </div>

              {/* Admin Code – only shown when admin is selected */}
              {formData.role === 'admin' && (
                <div className="relative animate-fadeIn">
                  <Lock className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                  <input
                    name="adminCode"
                    type="password"
                    value={formData.adminCode}
                    onChange={handleChange}
                    required={formData.role === 'admin'}
                    placeholder="Enter admin security code"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                      isDark 
                        ? 'bg-slate-800/60 border-slate-700 text-white placeholder-slate-400 focus:border-yellow-500' 
                        : 'bg-white border-amber-200 text-gray-900 placeholder-gray-400 focus:border-amber-400'
                    } ${formData.role === 'admin' && !formData.adminCode.trim() ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700 text-white placeholder-slate-400 focus:border-yellow-500' 
                  : 'bg-white border-amber-200 text-gray-900 placeholder-gray-400 focus:border-amber-400'
              }`}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700 text-white placeholder-slate-400 focus:border-yellow-500' 
                  : 'bg-white border-amber-200 text-gray-900 placeholder-gray-400 focus:border-amber-400'
              }`}
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/30">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-400 text-white'
            }`}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>

          {/* Toggle Login/Signup */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  role: 'member',
                  adminCode: ''
                });
                setError('');
              }}
              className={`text-sm transition-colors ${
                isDark ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'
              }`}
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;