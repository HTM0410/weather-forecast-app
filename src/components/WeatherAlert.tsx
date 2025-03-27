import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatDate } from '../services/weatherService';

interface WeatherAlertProps {
  alerts: {
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
  }[];
  timezone_offset: number;
}

const WeatherAlert: React.FC<WeatherAlertProps> = ({ alerts, timezone_offset }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-white bg-opacity-90 rounded-xl p-6 shadow-lg w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <AlertTriangle className="text-red-500 mr-2" />
        Cảnh báo thời tiết
      </h2>
      
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div 
            key={index} 
            className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 rounded"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-red-700">{alert.event}</h3>
              <span className="text-sm text-gray-500">
                {formatDate(alert.start, 'time', timezone_offset)} - {formatDate(alert.end, 'time', timezone_offset)}
              </span>
            </div>
            <p className="text-sm mt-2 text-gray-700">{alert.description}</p>
            <p className="text-xs mt-1 text-gray-500">Nguồn: {alert.sender_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherAlert; 