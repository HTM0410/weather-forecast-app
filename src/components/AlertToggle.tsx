import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';

const ALERT_TOGGLE_KEY = 'weather_alerts_toggle';

interface AlertToggleProps {
  onToggle: (enabled: boolean) => void;
  className?: string;
}

const AlertToggle: React.FC<AlertToggleProps> = ({ onToggle, className = '' }) => {
  const [enabled, setEnabled] = useState(() => {
    try {
      const savedState = localStorage.getItem(ALERT_TOGGLE_KEY);
      if (savedState !== null) {
        return JSON.parse(savedState);
      }
      return true; // Mặc định bật cảnh báo
    } catch (error) {
      console.error('Lỗi khi đọc trạng thái cảnh báo:', error);
      return true;
    }
  });

  useEffect(() => {
    // Gọi callback khi trạng thái thay đổi
    onToggle(enabled);
    
    // Lưu trạng thái vào localStorage
    try {
      localStorage.setItem(ALERT_TOGGLE_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('Lỗi khi lưu trạng thái cảnh báo:', error);
    }
  }, [enabled, onToggle]);

  const toggle = () => {
    setEnabled((prev: boolean) => !prev);
  };

  return (
    <div className={`${className} flex items-center space-x-2`}>
      <button
        onClick={toggle}
        className={`relative inline-flex flex-shrink-0 h-8 w-16 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          enabled ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`pointer-events-none inline-block h-7 w-7 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
            enabled ? 'translate-x-8' : 'translate-x-0'
          }`}
        />
        <span 
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            enabled ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <BellOff size={16} className="text-white" />
        </span>
        <span 
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            enabled ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Bell size={16} className="text-white" />
        </span>
      </button>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
        {enabled ? 'Đang bật cảnh báo' : 'Đã tắt cảnh báo'}
      </span>
    </div>
  );
};

export default AlertToggle; 