import React from 'react';
import { useTheme } from '../../context/themeContext';

const StatsCard = ({ label, value, icon, change, color }) => {
  const { isDark } = useTheme();

  return (
    <div className={`
      group p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 cursor-pointer
      border-yellow-400/30 hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] 
      ${isDark 
        ? 'bg-slate-800/40 hover:bg-slate-800/70' 
        : 'bg-white/95 hover:bg-yellow-50/30'
      }
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl border-2 border-yellow-400 text-yellow-400 transition-all duration-300 group-hover:border-yellow-300 group-hover:text-yellow-300`}>
          {icon}
        </div>
      </div>

      <div className={`text-3xl font-bold mb-1 transition-colors group-hover:text-yellow-400 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>

      <div className={`text-sm mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
        {label}
      </div>

      {change && (
        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {change}
        </div>
      )}
    </div>
  );
};

export default StatsCard;