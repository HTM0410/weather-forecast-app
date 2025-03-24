import { useState, useEffect } from 'react';
import { 
  getWeatherByCoordinates, 
  getForecast, 
  getOneCallData 
} from '../services/weatherService';
import { WeatherData, ForecastData, OneCallData } from '../types/weather';

interface WeatherState {
  loading: boolean;
  error: string | null;
  currentWeather: WeatherData | null;
  forecast: ForecastData | null;
  oneCallData: OneCallData | null;
}

export const useWeather = (lat: number | null, lon: number | null, units = 'metric') => {
  const [state, setState] = useState<WeatherState>({
    loading: true,
    error: null,
    currentWeather: null,
    forecast: null,
    oneCallData: null,
  });

  useEffect(() => {
    if (lat === null || lon === null) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const [currentWeatherData, forecastData, oneCallData] = await Promise.all([
          getWeatherByCoordinates(lat, lon, units),
          getForecast(lat, lon, units),
          getOneCallData(lat, lon, units)
        ]);

        setState({
          loading: false,
          error: null,
          currentWeather: currentWeatherData,
          forecast: forecastData,
          oneCallData: oneCallData
        });
      } catch {
        setState({
          loading: false,
          error: 'Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau.',
          currentWeather: null,
          forecast: null,
          oneCallData: null
        });
      }
    };

    fetchData();
  }, [lat, lon, units]);

  return state;
};
