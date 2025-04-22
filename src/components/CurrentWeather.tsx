import React from 'react';
import { Droplets, Wind, Thermometer, Sunrise, Sunset, Eye } from 'lucide-react';
import { WeatherData } from '../types/weather';
import { getWeatherIcon, formatDate } from '../services/weatherService';

interface CurrentWeatherProps {
  data: WeatherData;
  units: 'metric' | 'imperial';
  onToggleUnits: () => void;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data, units, onToggleUnits }) => {
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const speedUnit = units === 'metric' ? 'm/s' : 'mph';

  return (
    <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm rounded-xl p-6 shadow-lg w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text">{data.name}, {data.sys.country}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {formatDate(data.dt, 'full', data.timezone)}
          </p>
        </div>
        <button
          onClick={onToggleUnits}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm transition-colors"
        >
          {units === 'metric' ? '°F' : '°C'}
        </button>
      </div>

      <div className="flex items-center mt-4">
        <img 
          src={getWeatherIcon(data.weather[0].icon)} 
          alt={data.weather[0].description}
          className="w-24 h-24"
        />
        <div className="ml-4">
          <div className="text-5xl font-bold text-gray-900 dark:text-dark-text">{Math.round(data.main.temp)}{tempUnit}</div>
          <div className="text-xl capitalize text-gray-700 dark:text-gray-300">{data.weather[0].description}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        <div className="flex items-center">
          <Thermometer className="text-blue-500 mr-2" size={20} />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cảm giác như</p>
            <p className="font-semibold text-gray-900 dark:text-dark-text">{Math.round(data.main.feels_like)}{tempUnit}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Droplets className="text-blue-500 mr-2" size={20} />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Độ ẩm</p>
            <p className="font-semibold text-gray-900 dark:text-dark-text">{data.main.humidity}%</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Wind className="text-blue-500 mr-2" size={20} />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gió</p>
            <p className="font-semibold text-gray-900 dark:text-dark-text">{data.wind.speed} {speedUnit}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Sunrise className="text-orange-500 mr-2" size={20} />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bình minh</p>
            <p className="font-semibold text-gray-900 dark:text-dark-text">{formatDate(data.sys.sunrise, 'time', data.timezone)}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Sunset className="text-orange-500 mr-2" size={20} />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hoàng hôn</p>
            <p className="font-semibold text-gray-900 dark:text-dark-text">{formatDate(data.sys.sunset, 'time', data.timezone)}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Eye className="text-blue-500 mr-2" size={20} />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tầm nhìn</p>
            <p className="font-semibold text-gray-900 dark:text-dark-text">{(data.visibility / 1000).toFixed(1)} km</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
