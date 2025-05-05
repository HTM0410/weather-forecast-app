import React, { useState, useEffect } from 'react';
import { Bell, BellOff, AlertTriangle, Settings } from 'lucide-react';

const ALERT_SETTINGS_KEY = 'weather_alert_settings';

interface AlertSettingsProps {
  onSettingsChange: (settings: {
    notificationsEnabled: boolean;
    highSeverityOnly: boolean;
    autoExpandAlerts: boolean;
  }) => void;
}

type AlertSettings = {
  notificationsEnabled: boolean;
  highSeverityOnly: boolean;
  autoExpandAlerts: boolean;
};

const AlertSettings: React.FC<AlertSettingsProps> = ({ onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem(ALERT_SETTINGS_KEY);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Lỗi khi đọc cài đặt cảnh báo:', error);
    }
    
    // Cài đặt mặc định
    return {
      notificationsEnabled: true,
      highSeverityOnly: true,
      autoExpandAlerts: true
    };
  });
  
  useEffect(() => {
    // Thông báo thay đổi cài đặt lên component cha
    onSettingsChange(settings);
    
    // Lưu cài đặt vào localStorage
    try {
      localStorage.setItem(ALERT_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Lỗi khi lưu cài đặt cảnh báo:', error);
    }
  }, [settings, onSettingsChange]);
  
  const updateSetting = (key: keyof AlertSettings, value: boolean) => {
    setSettings((prev: AlertSettings) => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Cài đặt cảnh báo"
      >
        <Settings size={18} className="text-gray-700 dark:text-gray-300" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-dark-card shadow-lg rounded-lg p-4 w-72 z-10">
          <h3 className="text-gray-900 dark:text-dark-text font-medium mb-3 flex items-center">
            <AlertTriangle size={16} className="mr-2 text-red-500" />
            Cài đặt cảnh báo
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Bật thông báo cảnh báo
              </label>
              <button
                onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
                className={`p-1.5 rounded-full ${
                  settings.notificationsEnabled 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {settings.notificationsEnabled ? (
                  <Bell size={14} />
                ) : (
                  <BellOff size={14} />
                )}
              </button>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="highSeverityOnly"
                checked={settings.highSeverityOnly}
                onChange={(e) => updateSetting('highSeverityOnly', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-500 rounded"
              />
              <label htmlFor="highSeverityOnly" className="text-sm text-gray-700 dark:text-gray-300">
                Chỉ thông báo cảnh báo mức độ cao
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoExpandAlerts"
                checked={settings.autoExpandAlerts}
                onChange={(e) => updateSetting('autoExpandAlerts', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-500 rounded"
              />
              <label htmlFor="autoExpandAlerts" className="text-sm text-gray-700 dark:text-gray-300">
                Tự động mở rộng cảnh báo quan trọng
              </label>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSettings; 