import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Bell, BellOff, ChevronDown, ChevronUp, X } from 'lucide-react';
import { OneCallData, WeatherAlert } from '../types/weather';
import { formatDate } from '../services/weatherService';
import AlertSettings from './AlertSettings';
import AlertToast from './AlertToast';

// Các key cho localStorage
const ALERTS_STATE_KEY = 'weather_alerts_state';

// Định nghĩa interface cho cài đặt cảnh báo
interface AlertSettingsData {
  notificationsEnabled: boolean;
  highSeverityOnly: boolean;
  autoExpandAlerts: boolean;
}

// Phân loại cảnh báo theo mức độ nghiêm trọng
const getAlertSeverity = (alert: WeatherAlert): 'high' | 'medium' | 'low' => {
  const event = alert.event.toLowerCase();
  const description = alert.description.toLowerCase();
  
  // Các từ khóa nguy hiểm cao
  const highKeywords = ['emergency', 'warning', 'severe', 'extreme', 'danger', 'hurricane', 'tornado', 'tsunami'];
  
  // Các từ khóa nguy hiểm trung bình
  const mediumKeywords = ['watch', 'advisory', 'moderate', 'caution'];
  
  if (highKeywords.some(keyword => event.includes(keyword) || description.includes(keyword))) {
    return 'high';
  } else if (mediumKeywords.some(keyword => event.includes(keyword) || description.includes(keyword))) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Lấy màu sắc phù hợp với mức độ cảnh báo
const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
  switch (severity) {
    case 'high':
      return {
        border: 'border-red-500 dark:border-red-500/70',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        icon: 'text-red-600'
      };
    case 'medium':
      return {
        border: 'border-orange-500 dark:border-orange-500/70',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-800 dark:text-orange-300',
        icon: 'text-orange-600'
      };
    default:
      return {
        border: 'border-yellow-500 dark:border-yellow-500/70',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        icon: 'text-yellow-600'
      };
  }
};

interface WeatherAlertsProps {
  data: OneCallData;
  // Thêm prop mới để nhận trạng thái cảnh báo từ FloatingControls
  isMuted?: boolean;
}

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ 
  data, 
  isMuted = false
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  const [expandedAlerts, setExpandedAlerts] = useState<number[]>([]);
  const [alertsMuted, setAlertsMuted] = useState(isMuted);
  const [toastAlert, setToastAlert] = useState<WeatherAlert | null>(null);
  
  // Cài đặt cảnh báo
  const [alertSettings, setAlertSettings] = useState<AlertSettingsData>({
    notificationsEnabled: true,
    highSeverityOnly: false,
    autoExpandAlerts: true
  });
  
  // Đồng bộ trạng thái cảnh báo với prop từ FloatingControls
  useEffect(() => {
    setAlertsMuted(isMuted);
  }, [isMuted]);
  
  // Quản lý thay đổi cài đặt từ component con
  const handleSettingsChange = useCallback((newSettings: AlertSettingsData) => {
    setAlertSettings(newSettings);
  }, []);
  
  // Đọc danh sách cảnh báo đã ẩn từ localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(ALERTS_STATE_KEY);
      if (savedState) {
        const { dismissedEvents, muted } = JSON.parse(savedState);
        
        if (data.alerts) {
          // Khôi phục chỉ số dựa trên tên sự kiện
          const indexes = data.alerts
            .map((alert, index) => ({ alert, index }))
            .filter(({ alert }) => dismissedEvents.includes(alert.event))
            .map(({ index }) => index);
          
          setDismissedAlerts(indexes);
        }
        
        // Nếu trạng thái được đọc từ localStorage mà chưa được truyền qua props
        if (muted !== undefined && isMuted === false) {
          setAlertsMuted(muted);
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc trạng thái cảnh báo:', error);
    }
  }, [data.alerts, isMuted]);
  
  // Lưu danh sách cảnh báo đã ẩn vào localStorage
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
    setAlertsMuted(!alertsMuted);
    if (!alertsMuted && data.alerts) {
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
    </>
  );
};

export default WeatherAlerts;
