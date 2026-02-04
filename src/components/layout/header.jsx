import React, { useState } from 'react';
import { Search, Bell, Plus, Sun, Moon, FolderPlus } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import Button from '../shared/button';
import SearchBar from '../shared/searchBar';
import TaskModal from '../projects/taskModal';
import ProjectModal from '../projects/projectModal';

export default function Header({ activePage, onProjectCreated, onSearch }) {
  const { isDark, toggleTheme } = useTheme();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleProject = () => {
    setShowProjectModal(true);
  };

  const handleTask = () => {
    setShowTaskModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <>
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md transition-all duration-300 ${
        isDark ? 'bg-slate-900/90 border-slate-700/50' : 'bg-white/90 border-gray-200/50'
      }`}>
        <div className="px-8 py-4 flex items-center justify-between">
          <h1 className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </h1>

          <div className="flex items-center gap-6">
            <SearchBar 
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={`Search ${activePage === 'dashboard' ? 'projects' : 'tasks'}...`}
            />

            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200/20 transition-all duration-300 hover:scale-110 hover:rotate-12"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-amber-600" />}
            </button>

            <button className="relative p-2 rounded-full hover:bg-gray-200/20 transition-all duration-300 hover:scale-110">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>

            <Button 
              variant="primary"
              icon={<FolderPlus className="w-5 h-5" />}
              onClick={handleProject}
              className="bg-yellow-500 hover:bg-yellow-400 text-white hover:shadow-yellow-500/40 hover:scale-105 transition-all duration-300"
            >
              New Project
            </Button>

            <Button 
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              onClick={handleTask}
              className="bg-yellow-500 hover:bg-yellow-400 text-white hover:shadow-yellow-500/40 hover:scale-105 transition-all duration-300"
            >
              New Task
            </Button>
          </div>
        </div>
      </header>

      {showTaskModal && (
        <TaskModal 
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {showProjectModal && (
        <ProjectModal 
          onClose={() => setShowProjectModal(false)}
          onSuccess={onProjectCreated}
        />
      )}
    </>
  );
}