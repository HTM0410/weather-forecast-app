import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  console.log('Current theme:', theme); // Debug log

  const handleClick = () => {
    console.log('Toggle button clicked'); // Debug log
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 p-3 rounded-full bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm shadow-lg 
        hover:bg-white/100 dark:hover:bg-dark-card/100 
        active:scale-95
        transition-all duration-300 transform hover:scale-110
        cursor-pointer
        z-50"
      aria-label={`Chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}`}
    >
      {theme === 'light' ? (
        <Moon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
      ) : (
        <Sun className="w-6 h-6 text-yellow-500" />
      )}
    </button>
  );
};

export default ThemeToggle; 