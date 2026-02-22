import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/themeContext';
import API from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Analytics() {
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get('/analytics');
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
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
        {error}
      </div>
    );
  }

  const statusColors = { todo: '#ef4444', inProgress: '#fbbf24', done: '#22c55e' };
  const priorityColors = { low: '#22c55e', medium: '#fbbf24', high: '#ef4444' };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: analytics.summary.totalUsers },
          { label: 'Total Projects', value: analytics.summary.totalProjects },
          { label: 'Total Tasks', value: analytics.summary.totalTasks }
        ].map(({ label, value }) => (
          <div
            key={label}
            className={`p-6 rounded-2xl border ${
              isDark
                ? 'bg-slate-800/40 border-yellow-500/20 text-white'
                : 'bg-white border-yellow-300/50 text-gray-900'
            }`}
          >
            <div className="text-3xl font-bold text-yellow-400">{value}</div>
            <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-yellow-500/20' : 'bg-white border-yellow-300/50'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={analytics.tasksByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} label>
                {analytics.tasksByStatus.map((entry) => (
                  <Cell key={entry._id} fill={statusColors[entry._id] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks by Priority */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-yellow-500/20' : 'bg-white border-yellow-300/50'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={analytics.tasksByPriority} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} label>
                {analytics.tasksByPriority.map((entry) => (
                  <Cell key={entry._id} fill={priorityColors[entry._id] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Performance Bar Chart */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-yellow-500/20' : 'bg-white border-yellow-300/50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>User Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.userAnalytics}>
            <XAxis dataKey="user" stroke={isDark ? '#94a3b8' : '#6b7280'} />
            <YAxis stroke={isDark ? '#94a3b8' : '#6b7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#fff',
                borderColor: isDark ? '#475569' : '#e2e8f0',
                color: isDark ? '#e2e8f0' : '#111827'
              }}
            />
            <Legend />
            <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="inProgress" name="In Progress" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            <Bar dataKey="todo" name="To Do" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User Table */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-yellow-500/20' : 'bg-white border-yellow-300/50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>User Breakdown</h3>
        <table className="w-full">
          <thead>
            <tr className={`text-left text-sm ${isDark ? 'text-slate-400 border-b border-slate-700' : 'text-gray-500 border-b border-gray-200'}`}>
              <th className="pb-3">Name</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Done</th>
              <th className="pb-3">In Progress</th>
              <th className="pb-3">To Do</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {analytics.userAnalytics.map((u, i) => (
              <tr key={i} className={`text-sm ${isDark ? 'border-b border-slate-700/50 text-slate-300' : 'border-b border-gray-100 text-gray-700'}`}>
                <td className="py-3 font-medium">{u.user}</td>
                <td className="py-3 capitalize">{u.role}</td>
                <td className="py-3">{u.totalTasks}</td>
                <td className="py-3 text-green-400">{u.completed}</td>
                <td className="py-3 text-yellow-400">{u.inProgress}</td>
                <td className="py-3 text-red-400">{u.todo}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}