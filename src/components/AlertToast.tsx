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
    <div 
      className={`fixed bottom-6 right-6 bg-white dark:bg-dark-card shadow-lg rounded-lg p-4 w-80 flex items-start transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <AlertTriangle className="text-red-500 flex-shrink-0 mr-3" size={20} />
      
      <div className="flex-1">
        <div className="font-medium text-gray-900 dark:text-dark-text mb-1">{alert.event}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{alert.description}</div>
        <button 
          className="text-sm text-blue-500 hover:underline mt-1"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('weather-alerts')?.scrollIntoView({ behavior: 'smooth' });
            onClose();
          }}
        >
          Xem chi tiết
        </button>
      </div>
      
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default AlertToast; 