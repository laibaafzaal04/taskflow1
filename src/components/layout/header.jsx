import React, { useState } from 'react';
import { Search, Bell, Plus, Sun, Moon, FolderPlus, User } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../shared/button';
import SearchBar from '../shared/searchBar';
import TaskModal from '../projects/taskModal';
import ProjectModal from '../projects/projectModal';
import EditProfile from '../../components/profile/editProfile';

export default function Header({ activePage, onProjectCreated, onSearch }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [searchValue, setSearchValue] = useState('');

  const handleProject = () => setShowProjectModal(true);
  const handleTask = () => setShowTaskModal(true);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setUnreadCount(0);
  };

  return (
    <>
      <header
        className={`h-16 px-6 flex items-center justify-between border-b transition-all duration-300 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        {/* Left side empty now – no logo/text */}
        <div className="min-w-[80px]" />

        {/* Center – Search bar takes most space */}
        <div className="flex-1 flex justify-center max-w-3xl mx-auto">
          <SearchBar
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search tasks, projects..."
            className="w-full max-w-2xl"
          />
        </div>

        {/* Right side – all icons + admin actions */}
        <div className="flex items-center gap-4 min-w-[220px] justify-end">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200/20 transition-all duration-300 hover:rotate-45"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          <div className="relative">
            <button onClick={handleNotificationClick} className="p-2 rounded-full hover:bg-gray-200/20 relative">
              <Bell className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-3 w-72 p-4 rounded-xl border shadow-2xl z-50 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-white border-gray-200 text-gray-800'
                }`}
              >
                <h4 className="font-semibold text-base mb-3">Notifications</h4>
                <p className="text-sm opacity-70">No new notifications</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowProfileModal(true)}
            className="p-2 rounded-full hover:bg-gray-200/20 transition-all"
          >
            <User className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
          </button>

          {user.role === 'admin' && activePage === 'projects' && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                icon={<FolderPlus className="w-4 h-4" />}
                onClick={handleProject}
                className="border-yellow-500/50 hover:border-yellow-400 text-yellow-400 hover:text-white hover:bg-yellow-500/20"
              >
                New Project
              </Button>

              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleTask}
                className="bg-yellow-500 hover:bg-yellow-400 text-white shadow-md shadow-yellow-500/30"
              >
                New Task
              </Button>
            </div>
          )}
        </div>
      </header>

      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} />}
      {showProjectModal && (
        <ProjectModal onClose={() => setShowProjectModal(false)} onSuccess={onProjectCreated} />
      )}
      {showProfileModal && <EditProfile onClose={() => setShowProfileModal(false)} />}
    </>
  );
}