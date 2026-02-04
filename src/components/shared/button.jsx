import React from 'react';
import { useTheme } from '../../context/themeContext';

export default function Button({ children, variant = 'primary', icon, onClick, className = '', disabled = false }) {
  const { isDark } = useTheme();
  
  const variants = {
    primary: `
      bg-yellow-500 
      hover:bg-yellow-400 
      text-white 
      hover:shadow-lg hover:shadow-yellow-500/40 
      hover:scale-105
    `,
    secondary: isDark 
      ? 'bg-slate-800/70 border border-yellow-600/50 hover:border-yellow-500/70 text-white hover:bg-yellow-900/20' 
      : 'bg-white border border-yellow-400 hover:border-yellow-500 text-gray-800 hover:bg-yellow-50/50',
    ghost: isDark 
      ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20' 
      : 'text-yellow-600 hover:text-yellow-500 hover:bg-yellow-100/50'
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 
        px-6 py-2.5 
        rounded-xl 
        font-semibold 
        transition-all duration-300 
        disabled:opacity-50 
        disabled:cursor-not-allowed 
        ${variants[variant]} 
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
}