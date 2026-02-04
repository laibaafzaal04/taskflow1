import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/themeContext';
import Sidebar from './components/layout/sidebar';
import Header from './components/layout/header';
import Dashboard from './pages/dashboard';
import Projects from './pages/projects';
import Login from './pages/login';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const { user, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

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
          <Header activePage={activePage} />
          
          <div className="flex-1 overflow-auto p-8">
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'projects' && <Projects />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppContent;