import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, BellOff, AlertTriangle, X, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { WeatherAlert } from '../types/weather';

interface FloatingControlsProps {
  onAlertToggle: (enabled: boolean) => void;
  isAlertEnabled: boolean;
  alerts?: WeatherAlert[];
  locationName?: string;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({ 
  onAlertToggle, 
  isAlertEnabled, 
  alerts = [],
  locationName = ''
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showAlertInfo, setShowAlertInfo] = useState(false);
  
  const hasAlerts = alerts && alerts.length > 0;

  // Auto-hide alert info after 5 seconds
  useEffect(() => {
    if (showAlertInfo) {
      const timer = setTimeout(() => {
        setShowAlertInfo(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showAlertInfo]);

  const handleAlertToggle = () => {
    const newState = !isAlertEnabled;
    onAlertToggle(newState);
    
    // Hiển thị thông tin cảnh báo khi bật
    if (newState) {
      setShowAlertInfo(true);
    }
  };

  const closeAlertInfo = () => {
    setShowAlertInfo(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-3">
      {/* Thông tin cảnh báo popup */}
      {showAlertInfo && (
        <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-2 w-72 relative animate-fade-in-up">
          <button 
            onClick={closeAlertInfo}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-start">
            {hasAlerts ? (
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mr-3">
                <AlertTriangle className="text-red-500" size={18} />
              </div>
            ) : (
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                <Check className="text-green-500" size={18} />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {hasAlerts ? 'Cảnh báo thời tiết' : 'Không có cảnh báo thời tiết'}
              </h3>
              
              {hasAlerts ? (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Có {alerts.length} cảnh báo thời tiết cho khu vực {locationName || 'của bạn'}
                </p>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Khu vực {locationName || 'của bạn'} hiện đang an toàn.
                </p>
              )}
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {isAlertEnabled 
                  ? 'Bạn sẽ nhận được thông báo nếu có cảnh báo mới.'
                  : 'Thông báo cảnh báo đã bị tắt.'}
              </p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-1 rounded-full animate-progress"></div>
          </div>
        </div>
      )}
      
      {/* Nút tắt/bật cảnh báo */}
      <button
        onClick={handleAlertToggle}
        className={`p-3 rounded-full backdrop-blur-sm shadow-lg 
          active:scale-95
          transition-all duration-300 transform hover:scale-110
          cursor-pointer
          ${isAlertEnabled 
            ? hasAlerts
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-400/80 dark:bg-gray-700/80 hover:bg-gray-500/80 dark:hover:bg-gray-600/80 text-gray-100'
          }`}
        aria-label={`${isAlertEnabled ? 'Tắt' : 'Bật'} cảnh báo thời tiết`}
        title={`${isAlertEnabled ? 'Tắt' : 'Bật'} cảnh báo thời tiết`}
      >
        {isAlertEnabled ? (
          <Bell className="w-6 h-6" />
        ) : (
          <BellOff className="w-6 h-6" />
        )}
      </button>
      
      {/* Nút tắt/bật theme */}
      <button
        onClick={toggleTheme}
        className="p-3 rounded-full bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm shadow-lg 
          hover:bg-white/100 dark:hover:bg-dark-card/100 
          active:scale-95
          transition-all duration-300 transform hover:scale-110
          cursor-pointer"
        aria-label={`Chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}`}
        title={`Chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}`}
      >
        {theme === 'light' ? (
          <Moon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        ) : (
          <Sun className="w-6 h-6 text-yellow-500" />
        )}
      </button>
    </div>
  );
};

export default FloatingControls; 