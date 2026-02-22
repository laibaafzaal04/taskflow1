import React from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../../context/themeContext';

const SearchBar = ({ placeholder = "Search tasks, projects...", value, onChange, className = '' }) => {
  const { isDark } = useTheme();

  return (
    // Fix: apply the className prop so callers can control width (e.g. w-full from Header)
    <div className={`relative group ${className}`}>
      <Search
        className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
          isDark
            ? 'text-slate-400 group-hover:text-amber-400 group-focus-within:text-amber-400'
            : 'text-gray-400 group-hover:text-amber-600 group-focus-within:text-amber-600'
        }`}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all duration-300 ${
          isDark
            ? 'bg-slate-800/60 border border-amber-700/40 text-white placeholder-amber-300/70 hover:border-amber-600/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30'
            : 'bg-white border border-amber-300 text-gray-900 placeholder-amber-600/70 hover:border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30'
        }`}
      />
    </div>
  );
};

export default SearchBar;