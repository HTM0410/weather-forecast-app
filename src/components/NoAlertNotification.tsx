import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface NoAlertNotificationProps {
  locationName: string;
  onClose: () => void;
}

const NO_ALERT_DISMISSED_KEY = 'no_alert_notification_dismissed';

const NoAlertNotification: React.FC<NoAlertNotificationProps> = ({ 
  locationName, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Kiểm tra xem người dùng đã đóng thông báo này chưa
  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem(NO_ALERT_DISMISSED_KEY) === 'true';
    
    if (!hasBeenDismissed) {
      // Đợi một chút rồi mới hiển thị thông báo
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-hide thông báo sau 5 giây
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    
    // Đợi animation kết thúc rồi mới xóa hoàn toàn
    setTimeout(() => {
      onClose();
      
      // Ghi nhớ rằng người dùng đã đóng thông báo này
      localStorage.setItem(NO_ALERT_DISMISSED_KEY, 'true');
    }, 300);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        className={`bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm shadow-lg rounded-lg p-4 max-w-md transition-all duration-300 transform animate-fade-in-up ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
        
        <div className="flex items-start">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
            <Check className="text-green-500" size={18} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Không có cảnh báo thời tiết</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {locationName ? `Khu vực ${locationName} hiện không có cảnh báo thời tiết nào.` 
              : 'Khu vực của bạn hiện đang an toàn.'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Bạn sẽ nhận được thông báo nếu có cảnh báo mới.
            </p>
          </div>
        </div>
        
        {/* Progress bar giống với FloatingControls */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-1 rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default NoAlertNotification; 