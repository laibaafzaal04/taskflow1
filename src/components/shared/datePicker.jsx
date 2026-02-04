import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/themeContext';

const DatePicker = ({ selectedDate, onDateSelect, onClose }) => {
  const { isDark } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelect = (day) => {
    // Create date in local timezone to avoid timezone issues
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formattedDate = `${year}-${month}-${dayStr}`;
    
    onDateSelect(formattedDate);
    onClose();
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    
    // Parse the selected date string (format: YYYY-MM-DD)
    const selected = new Date(selectedDate + 'T00:00:00'); // Add time to avoid timezone issues
    
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={`absolute z-50 mt-2 p-4 rounded-2xl shadow-2xl border-2 min-w-[320px] ${
        isDark 
          ? 'bg-slate-800 border-amber-500/30' 
          : 'bg-white border-amber-400/40'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          onMouseDown={(e) => e.stopPropagation()}
          className={`p-2 rounded-lg transition-all hover:bg-yellow-500/20 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          <ChevronLeft size={20} />
        </button>
        <span className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          onMouseDown={(e) => e.stopPropagation()}
          className={`p-2 rounded-lg transition-all hover:bg-yellow-500/20 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className={`text-center text-xs font-medium ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => (
          <button
            type="button"
            key={day}
            onClick={() => handleSelect(day)}
            onMouseDown={(e) => e.stopPropagation()}
            className={`p-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-110 hover:bg-yellow-500/20 ${
              isSelected(day)
                ? 'bg-yellow-500 text-white hover:bg-yellow-400'
                : isDark
                ? 'text-white hover:bg-slate-700/50'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Close */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`text-sm px-4 py-2 rounded-xl hover:bg-yellow-500/20 transition-all ${
            isDark ? 'text-slate-300' : 'text-gray-700'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DatePicker;