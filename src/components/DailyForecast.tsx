import React from 'react';
import { OneCallData } from '../types/weather';
import { getWeatherIcon, formatDate } from '../services/weatherService';

interface DailyForecastProps {
  data: OneCallData;
  units: 'metric' | 'imperial';
}

const DailyForecast: React.FC<DailyForecastProps> = ({ data, units }) => {
  const tempUnit = units === 'metric' ? '°C' : '°F';
  
  // Get the next 7 days
  const dailyData = data.daily.slice(0, 7);

  return (
    <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm rounded-xl p-6 shadow-lg w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-dark-text">Dự báo 7 ngày tới</h2>
      
      <div className="space-y-4">
        {dailyData.map((day) => {
          // Format the date as day of week and calendar date
          const dayOfWeek = formatDate(day.dt, 'day', data.timezone_offset);
          const calendarDate = formatDate(day.dt, 'date', data.timezone_offset);
          
          return (
            <div key={day.dt} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
              <div className="w-28">
                <p className="font-medium text-gray-900 dark:text-dark-text">{dayOfWeek}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{calendarDate}</p>
              </div>
              
              <div className="flex items-center">
                <img 
                  src={getWeatherIcon(day.weather[0].icon)} 
                  alt={day.weather[0].description}
                  className="w-12 h-12"
                />
                <span className="ml-2 text-sm capitalize text-gray-700 dark:text-gray-300">{day.weather[0].description}</span>
              </div>
              
              <div className="flex space-x-4">
                <span className="font-bold text-gray-900 dark:text-dark-text">{Math.round(day.temp.max)}{tempUnit}</span>
                <span className="text-gray-500 dark:text-gray-400">{Math.round(day.temp.min)}{tempUnit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast;
