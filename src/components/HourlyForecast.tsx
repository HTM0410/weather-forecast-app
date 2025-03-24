import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { OneCallData } from '../types/weather';
import { getWeatherIcon, formatDate } from '../services/weatherService';

interface HourlyForecastProps {
  data: OneCallData;
  units: 'metric' | 'imperial';
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ data, units }) => {
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Get the next 24 hours
  const hourlyData = data.hourly?.slice(0, 24) || [];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -200 : 200;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!hourlyData.length) return null;

  return (
    <div className="bg-white bg-opacity-90 rounded-xl p-6 shadow-lg w-full max-w-2xl mx-auto mt-6 relative">
      <h2 className="text-xl font-bold mb-4">Dự báo theo giờ</h2>
      
      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-full p-1 shadow-md"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto pb-2 scrollbar-hide space-x-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {hourlyData.map((hour) => (
            <div key={hour.dt} className="flex flex-col items-center min-w-[80px]">
              <p className="text-sm font-medium">{formatDate(hour.dt, data.timezone_offset, 'time')}</p>
              <img 
                src={getWeatherIcon(hour.weather[0].icon)} 
                alt={hour.weather[0].description}
                className="w-12 h-12 my-1"
              />
              <p className="font-bold">{Math.round(hour.temp)}{tempUnit}</p>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-full p-1 shadow-md"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default HourlyForecast;
