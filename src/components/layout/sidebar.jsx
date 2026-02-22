import React from 'react';
import { LayoutDashboard, CheckSquare, Zap, LogOut, Users, BarChart2, ClipboardList } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activePage, setActivePage }) => {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
    { icon: <CheckSquare className="w-5 h-5" />, label: 'Projects', id: 'projects' },
  ];

  if (user.role === 'admin') {
    navItems.push(
      { icon: <Users className="w-5 h-5" />, label: 'Users', id: 'users' },
      { icon: <BarChart2 className="w-5 h-5" />, label: 'Analytics', id: 'analytics' }
    );
  } else {
    navItems.push(
      { icon: <ClipboardList className="w-5 h-5" />, label: 'My Tasks', id: 'myTasks' }
    );
  }

  const handleLogout = () => {
    if (window.confirm('Do you want to logout?')) {
      logout();
    }
  };

  return (
    <aside className={`flex flex-col border-r transition-all duration-300 w-64 ${
      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200'
    }`}>
      {/* Bright yellow logo area */}
      <div className={`h-16 flex items-center justify-center border-b font-bold text-2xl ${
        isDark 
          ? 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-transparent' 
          : 'border-yellow-400/30 bg-gradient-to-r from-yellow-400/10 to-transparent'
      }`}>
        <div className="flex items-center gap-2 text-yellow-400">
          <Zap className="w-8 h-8" />
          <span>TaskFlow</span>
        </div>
      </div>

      {/* Navigation – bright yellow active/hover */}
      <nav className="flex-1 flex flex-col p-4 gap-2">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setActivePage(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              activePage === item.id
                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                : isDark
                  ? 'text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-400'
                  : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
            }`}
          >
            <div className={`transition-colors ${activePage === item.id ? 'text-white' : 'group-hover:text-yellow-400'}`}>
              {item.icon}
            </div>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User section */}
      <div className={`p-4 border-t ${
        isDark ? 'border-slate-800' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              isDark ? 'bg-yellow-600' : 'bg-yellow-500'
            }`}>
              {user?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'User'}
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-yellow-500/20 transition-all"
            title="Logout"
          >
            <LogOut className={`w-5 h-5 ${isDark ? 'text-slate-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;