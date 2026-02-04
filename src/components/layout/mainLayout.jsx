import React, { useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import Dashboard from '../../pages/dashboard';
import Projects from '../../pages/projects';
import { useTheme } from '../../context/themeContext';

export default function MainLayout() {
  const [activePage, setActivePage] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useTheme();

  const handleProjectCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'
    }`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'
        }`}></div>
        <div 
          className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-purple-500/10' : 'bg-purple-500/5'
          }`}
          style={{animationDelay: '1s'}}
        ></div>
      </div>

      <div className="flex h-screen relative z-10">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header 
            activePage={activePage} 
            onProjectCreated={handleProjectCreated} 
            onSearch={handleSearch}
          />
          
          <div className="flex-1 overflow-auto p-8">
            {activePage === 'dashboard' && <Dashboard key={refreshKey} searchQuery={searchQuery} />}
            {activePage === 'projects' && <Projects key={refreshKey} searchQuery={searchQuery} />}
          </div>
        </main>
      </div>
    </div>
  );
}