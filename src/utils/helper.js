export const getPriorityColor = (priority, isDark) => {
  const colors = {
    high:   isDark ? 'text-red-400 bg-red-500/10 border-red-500/20'       : 'text-red-600 bg-red-50 border-red-200',
    medium: isDark ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low:    isDark ? 'text-green-400 bg-green-500/10 border-green-500/20'  : 'text-green-600 bg-green-50 border-green-200'
  };
  return colors[priority] || colors.medium;
};

// Fix: all 6 colors the project model supports (red, yellow, pink were missing)
export const getProjectColor = (color) => {
  const colors = {
    blue:   'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green:  'from-green-500 to-green-600',
    red:    'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-amber-600',
    pink:   'from-pink-500 to-pink-600'
  };
  return colors[color] || colors.blue;
};