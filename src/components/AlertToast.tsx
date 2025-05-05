import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { WeatherAlert } from '../types/weather';

interface AlertToastProps {
  alert: WeatherAlert;
  onClose: () => void;
  autoCloseTime?: number; // Thời gian tự động đóng (ms)
}

const AlertToast: React.FC<AlertToastProps> = ({ 
  alert, 
  onClose, 
  autoCloseTime = 5000 // Mặc định 5 giây
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Hiệu ứng hiển thị và tự động đóng
  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Đợi animation kết thúc rồi mới xóa hoàn toàn
    }, autoCloseTime);
    
    return () => clearTimeout(timer);
  }, [onClose, autoCloseTime]);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-3">
      <div 
        className={`bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-2 w-72 transition-all duration-300 transform animate-fade-in-up ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
        
        <div className="flex items-start">
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mr-3">
            <AlertTriangle className="text-red-500" size={18} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Cảnh báo thời tiết mới
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {alert.event}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
              {alert.description}
            </p>
            <button 
              className="text-xs text-blue-500 hover:underline mt-2 flex items-center"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('weather-alerts')?.scrollIntoView({ behavior: 'smooth' });
                onClose();
              }}
            >
              Xem chi tiết
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-1 rounded-full animate-progress"></div>
        </div>
      </div>
      
      {/* Placeholder cho không gian dành cho các nút */}
      <div className="w-full h-14"></div>
    </div>
  );
};

export default AlertToast; 