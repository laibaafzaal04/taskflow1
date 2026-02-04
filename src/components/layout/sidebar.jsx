import React from 'react';
import { LayoutDashboard, CheckSquare, Zap, LogOut } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activePage, setActivePage }) => {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
    { icon: <CheckSquare className="w-5 h-5" />, label: 'Projects', id: 'projects' },
  ];

  const handleLogout = () => {
    if (window.confirm('Do you want to logout?')) {
      logout();
    }
  };

  return (
    <aside className={`flex flex-col border-r transition-all duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200'
    }`}>
      {/* Logo */}
      <div className="p-6 pb-4 flex items-center gap-3">
        <Zap className="w-8 h-8 text-yellow-500" />
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          TaskFlow
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              hover:scale-105
              ${activePage === item.id 
                ? 'bg-yellow-500 hover:bg-yellow-400 text-white' 
                : isDark 
                  ? 'text-slate-300 hover:bg-slate-800/70 hover:text-yellow-300' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-yellow-600'
              }
            `}
          >
            {React.cloneElement(item.icon, { 
              className: `w-5 h-5 ${
                activePage === item.id 
                  ? 'text-white' 
                  : isDark ? 'text-slate-400' : 'text-gray-500'
              }`
            })}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-6 pt-0 border-t border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white text-lg font-bold">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'User'}
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="transition-transform duration-300 hover:scale-125 p-2 rounded-full hover:bg-gray-200/20"
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