import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X, ChevronDown, ChevronUp, Bell, BellOff } from 'lucide-react';
import { OneCallData, WeatherAlert } from '../types/weather';
import { formatDate } from '../services/weatherService';
import AlertToast from './AlertToast';
import AlertSettings from './AlertSettings';
import NoAlertNotification from './NoAlertNotification';

// Định nghĩa các loại cảnh báo và mức độ nghiêm trọng
const getAlertSeverity = (alert: WeatherAlert): 'high' | 'medium' | 'low' => {
  const highSeverityKeywords = ['warning', 'tornado', 'hurricane', 'flood', 'severe', 'excessive'];
  const mediumSeverityKeywords = ['advisory', 'watch', 'storm'];
  
  const event = alert.event.toLowerCase();
  
  if (highSeverityKeywords.some(keyword => event.includes(keyword))) {
    return 'high';
  } else if (mediumSeverityKeywords.some(keyword => event.includes(keyword))) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Lấy màu sắc dựa trên mức độ nghiêm trọng
const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
  switch (severity) {
    case 'high':
      return {
        border: 'border-red-500',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
        icon: 'text-red-500'
      };
    case 'medium':
      return {
        border: 'border-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-700 dark:text-orange-400',
        icon: 'text-orange-500'
      };
    case 'low':
      return {
        border: 'border-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        icon: 'text-yellow-500'
      };
  }
};

// Khóa để lưu trạng thái vào localStorage
const ALERTS_STATE_KEY = 'weather_alerts_state';

interface WeatherAlertsProps {
  data: OneCallData;
  // Thêm prop mới để nhận trạng thái cảnh báo từ FloatingControls
  isMuted?: boolean;
}

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ data, isMuted = false }) => {
  const [expandedAlerts, setExpandedAlerts] = useState<number[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>(() => {
    // Lấy trạng thái đã lưu từ localStorage
    try {
      const savedState = localStorage.getItem(ALERTS_STATE_KEY);
      if (savedState) {
        const { dismissedEvents } = JSON.parse(savedState);
        
        // Nếu có data.alerts, lọc các sự kiện đã bỏ qua
        if (data.alerts) {
          // Trả về các chỉ số của các cảnh báo khớp với sự kiện đã bỏ qua
          return data.alerts
            .map((alert, index) => ({ alert, index }))
            .filter(item => dismissedEvents.includes(item.alert.event))
            .map(item => item.index);
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc trạng thái cảnh báo:', error);
    }
    
    return [];
  });
  
  // Thay đổi cách sử dụng alertsMuted để sử dụng giá trị từ prop
  const [localAlertsMuted, setLocalAlertsMuted] = useState<boolean>(() => {
    try {
      const savedState = localStorage.getItem(ALERTS_STATE_KEY);
      if (savedState) {
        const { muted } = JSON.parse(savedState);
        return muted || false;
      }
    } catch (error) {
      console.error('Lỗi khi đọc trạng thái tắt cảnh báo:', error);
    }
    return false;
  });
  
  // Sử dụng giá trị isMuted từ prop, nếu được cung cấp
  const alertsMuted = isMuted !== undefined ? isMuted : localAlertsMuted;
  
  const [toastAlert, setToastAlert] = useState<WeatherAlert | null>(null);
  const [showNoAlertNotification, setShowNoAlertNotification] = useState<boolean>(false);
  const [alertSettings, setAlertSettings] = useState({
    notificationsEnabled: true,
    highSeverityOnly: true,
    autoExpandAlerts: true
  });
  
  // Xử lý thay đổi cài đặt cảnh báo
  const handleSettingsChange = useCallback((newSettings: {
    notificationsEnabled: boolean;
    highSeverityOnly: boolean;
    autoExpandAlerts: boolean;
  }) => {
    setAlertSettings(newSettings);
    
    // Nếu cài đặt thông báo bị tắt, tắt luôn thông báo đang hiển thị
    if (!newSettings.notificationsEnabled) {
      setToastAlert(null);
    }
  }, []);
  
  // Lưu trạng thái vào localStorage khi thay đổi
  useEffect(() => {
    if (data.alerts) {
      // Lưu các tên sự kiện đã bỏ qua thay vì chỉ số
      const dismissedEvents = data.alerts
        .filter((_, index) => dismissedAlerts.includes(index))
        .map(alert => alert.event);
      
      try {
        localStorage.setItem(ALERTS_STATE_KEY, JSON.stringify({
          dismissedEvents,
          muted: alertsMuted
        }));
      } catch (error) {
        console.error('Lỗi khi lưu trạng thái cảnh báo:', error);
      }
    }
  }, [dismissedAlerts, alertsMuted, data.alerts]);
  
  // Kiểm tra cảnh báo mới và hiển thị thông báo
  useEffect(() => {
    if (!alertSettings.notificationsEnabled) return;
    
    if (data.alerts && data.alerts.length > 0) {
      // Tìm cảnh báo phù hợp với cài đặt
      const alertToShow = data.alerts.find(alert => {
        const severity = getAlertSeverity(alert);
        return alertSettings.highSeverityOnly 
          ? severity === 'high' 
          : true;
      });
      
      if (alertToShow && !alertsMuted) {
        setToastAlert(alertToShow);
      }
      
      // Có cảnh báo, không hiển thị thông báo "không có cảnh báo"
      setShowNoAlertNotification(false);
    } else {
      // Không có cảnh báo, hiển thị thông báo "không có cảnh báo"
      setShowNoAlertNotification(true);
    }
  }, [data.alerts, alertsMuted, alertSettings]);
  
  // Tự động mở cảnh báo nghiêm trọng cao khi lần đầu hiển thị
  useEffect(() => {
    if (!alertSettings.autoExpandAlerts) return;
    
    if (data.alerts) {
      const highSeverityIndexes = data.alerts
        .map((alert, index) => ({ alert, index }))
        .filter(item => getAlertSeverity(item.alert) === 'high')
        .map(item => item.index);
      
      if (highSeverityIndexes.length > 0) {
        setExpandedAlerts(highSeverityIndexes);
      }
    }
  }, [data.alerts, alertSettings.autoExpandAlerts]);

  const toggleAlert = (index: number) => {
    setExpandedAlerts(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const dismissAlert = (index: number) => {
    setDismissedAlerts(prev => [...prev, index]);
  };
  
  const toggleAllAlerts = () => {
    setLocalAlertsMuted(!localAlertsMuted);
    if (!localAlertsMuted && data.alerts) {
      // Tắt tất cả cảnh báo
      setDismissedAlerts(data.alerts.map((_, index) => index));
    } else {
      // Bật lại tất cả cảnh báo
      setDismissedAlerts([]);
    }
  };

  const activeAlerts = alertsMuted 
    ? [] 
    : data.alerts ? data.alerts.filter((_, index) => !dismissedAlerts.includes(index)) : [];

  if (activeAlerts.length === 0 && !alertsMuted && data.alerts && data.alerts.length > 0) {
    return null;
  }

  return (
    <>
      {data.alerts && data.alerts.length > 0 ? (
        <div id="weather-alerts" className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm rounded-xl p-6 shadow-lg w-full max-w-2xl mx-auto mt-6 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-dark-text">
              <AlertTriangle className="text-red-500 mr-2" size={20} />
              Cảnh báo thời tiết
            </h2>
            <div className="flex space-x-1">
              <AlertSettings onSettingsChange={handleSettingsChange} />
              <button 
                onClick={toggleAllAlerts}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={alertsMuted ? "Bật tất cả cảnh báo" : "Tắt tất cả cảnh báo"}
              >
                {alertsMuted ? (
                  <BellOff size={20} className="text-gray-500" />
                ) : (
                  <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
          
          {alertsMuted ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <BellOff size={24} className="mx-auto mb-2" />
              <p>Tất cả cảnh báo đã được tắt</p>
              <button 
                onClick={toggleAllAlerts}
                className="mt-3 text-blue-500 hover:underline text-sm"
              >
                Bật lại cảnh báo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert, index) => {
                const severity = getAlertSeverity(alert);
                const colors = getSeverityColor(severity);
                const isExpanded = expandedAlerts.includes(index);
                
                return (
                  <div 
                    key={index} 
                    className={`border ${colors.border} rounded-lg overflow-hidden transition-all duration-300`}
                  >
                    <div 
                      className={`${colors.bg} p-3 flex justify-between items-center cursor-pointer hover:brightness-95 transition-all`}
                      onClick={() => toggleAlert(index)}
                    >
                      <div className="flex items-center">
                        {severity === 'high' && (
                          <AlertTriangle className={`${colors.icon} mr-2`} size={18} />
                        )}
                        <div className={`font-medium ${colors.text}`}>{alert.event}</div>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">
                          {formatDate(alert.start, 'date', data.timezone_offset)} - {formatDate(alert.end, 'date', data.timezone_offset)}
                        </span>
                        
                        <button
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full mr-1 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAlert(index);
                          }}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissAlert(index);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                          title="Ẩn cảnh báo này"
                        >
                          <X size={18} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div 
                      className={`bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 max-h-0 ${
                        isExpanded ? 'max-h-96 p-4' : 'max-h-0 p-0'
                      }`}
                    >
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{alert.description}</p>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                        <span>Nguồn: {alert.sender_name}</span>
                        <span>
                          Bắt đầu: {formatDate(alert.start, 'time', data.timezone_offset)} - 
                          Kết thúc: {formatDate(alert.end, 'time', data.timezone_offset)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div id="weather-alerts" className="hidden">
          {/* Hidden container for scroll target */}
        </div>
      )}
      
      {/* Thông báo cảnh báo mới */}
      {toastAlert && alertSettings.notificationsEnabled && (
        <AlertToast 
          alert={toastAlert} 
          onClose={() => setToastAlert(null)} 
        />
      )}
      
      {/* Thông báo không có cảnh báo */}
      {!data.alerts?.length && showNoAlertNotification && alertSettings.notificationsEnabled && (
        <NoAlertNotification 
          locationName={data.timezone?.split('/').pop() || ''}
          onClose={() => setShowNoAlertNotification(false)}
        />
      )}
    </>
  );
};

export default WeatherAlerts;
