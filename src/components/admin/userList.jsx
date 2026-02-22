import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function UserList() {
  const { isDark } = useTheme();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await API.get('/users');
    setUsers(data);
  };

  const handleRoleChange = async (id, newRole, userName) => {
    // Fix: confirm before changing role — a misclick can accidentally demote an admin
    if (!window.confirm(`Change ${userName}'s role to ${newRole}?`)) return;
    try {
      await API.put(`/users/${id}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleActiveToggle = async (id, isActive) => {
    try {
      await API.put(`/users/${id}`, { isActive });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id, userName) => {
    if (window.confirm(`Permanently delete ${userName}? This cannot be undone.`)) {
      try {
        await API.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isDark ? 'bg-slate-800/40 border-yellow-500/20' : 'bg-white/95 border-yellow-300/50'
    }`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Users</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className={`text-left ${isDark ? 'text-slate-300 border-b border-slate-700' : 'text-gray-700 border-b border-gray-200'}`}>
            <th className="pb-4">Name</th>
            <th className="pb-4">Email</th>
            <th className="pb-4">Role</th>
            <th className="pb-4">Active</th>
            <th className="pb-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const isSelf = user._id === currentUser._id;
            return (
              <tr key={user._id} className={`${isDark ? 'border-b border-slate-700' : 'border-b border-gray-200'}`}>
                <td className="py-4">
                  {user.name}
                  {isSelf && <span className="ml-2 text-xs text-yellow-400">(you)</span>}
                </td>
                <td className="py-4">{user.email}</td>
                <td className="py-4">
                  <select
                    value={user.role}
                    disabled={isSelf}
                    onChange={e => handleRoleChange(user._id, e.target.value, user.name)}
                    className={`px-3 py-1 rounded-lg border transition-all ${
                      isSelf ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                      isDark
                        ? 'bg-slate-900 border-yellow-600 text-white focus:border-yellow-400'
                        : 'bg-white border-yellow-300 text-gray-900 focus:border-yellow-500'
                    }`}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </td>
                <td className="py-4">
                  <input
                    type="checkbox"
                    checked={user.isActive}
                    disabled={isSelf}
                    onChange={e => handleActiveToggle(user._id, e.target.checked)}
                    className={`w-4 h-4 rounded border transition-all ${
                      isSelf ? 'opacity-50 cursor-not-allowed' : ''
                    } ${isDark ? 'bg-slate-900 border-yellow-600 accent-yellow-400' : 'bg-white border-yellow-300 accent-yellow-500'}`}
                  />
                </td>
                <td className="py-4">
                  <button
                    onClick={() => handleDelete(user._id, user.name)}
                    disabled={isSelf}
                    className={`px-3 py-1 rounded-lg text-white transition-all ${
                      isSelf
                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-red-500 hover:bg-red-400'
                    }`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}