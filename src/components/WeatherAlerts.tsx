import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { OneCallData } from '../types/weather';
import { formatDate } from '../services/weatherService';

interface WeatherAlertsProps {
  data: OneCallData;
}

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ data }) => {
  const [expandedAlerts, setExpandedAlerts] = useState<number[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  if (!data.alerts || data.alerts.length === 0) {
    return null;
  }

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

  const activeAlerts = data.alerts.filter((_, index) => !dismissedAlerts.includes(index));

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white bg-opacity-90 rounded-xl p-6 shadow-lg w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <AlertTriangle className="text-red-500 mr-2" size={20} />
        Cảnh báo thời tiết
      </h2>
      
      <div className="space-y-4">
        {activeAlerts.map((alert, index) => (
          <div key={index} className="border border-red-200 rounded-lg overflow-hidden">
            <div 
              className="bg-red-50 p-3 flex justify-between items-center cursor-pointer"
              onClick={() => toggleAlert(index)}
            >
              <div className="font-medium text-red-700">{alert.event}</div>
              <div className="flex items-center">
                <span className="text-sm text-red-600 mr-4">
                  {formatDate(alert.start, data.timezone_offset, 'date')} - {formatDate(alert.end, data.timezone_offset, 'date')}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissAlert(index);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {expandedAlerts.includes(index) && (
              <div className="p-3 bg-white">
                <p className="text-gray-700 whitespace-pre-line">{alert.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherAlerts;
