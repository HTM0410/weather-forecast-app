import axios from 'axios';
import { WeatherData, ForecastData, OneCallData, GeocodingData } from '../types/weather';

interface WeatherItem {
  weather: Array<{
    description: string;
    main: string;
  }>;
}

interface Alert {
  event: string;
  description: string;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org';

export const getWeatherByCoordinates = async (lat: number, lon: number, units = 'metric'): Promise<WeatherData> => {
  try {
    const response = await axios.get(`${BASE_URL}/data/2.5/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units,
      },
    });
    
    // Translate weather description to Vietnamese
    if (response.data.weather && response.data.weather.length > 0) {
      response.data.weather[0].description = translateWeatherToVietnamese(response.data.weather[0].description);
      response.data.weather[0].main = translateWeatherMainToVietnamese(response.data.weather[0].main);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const getWeatherByCity = async (city: string, units = 'metric'): Promise<WeatherData> => {
  try {
    const response = await axios.get(`${BASE_URL}/data/2.5/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units,
      },
    });
    
    // Translate weather description to Vietnamese
    if (response.data.weather && response.data.weather.length > 0) {
      response.data.weather[0].description = translateWeatherToVietnamese(response.data.weather[0].description);
      response.data.weather[0].main = translateWeatherMainToVietnamese(response.data.weather[0].main);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const getForecast = async (lat: number, lon: number, units = 'metric'): Promise<ForecastData> => {
  try {
    const response = await axios.get(`${BASE_URL}/data/2.5/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units,
      },
    });
    
    // Translate weather descriptions in forecast
    if (response.data.list && response.data.list.length > 0) {
      response.data.list.forEach((item: WeatherItem) => {
        if (item.weather && item.weather.length > 0) {
          item.weather[0].description = translateWeatherToVietnamese(item.weather[0].description);
          item.weather[0].main = translateWeatherMainToVietnamese(item.weather[0].main);
        }
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
};

export const getOneCallData = async (lat: number, lon: number, units = 'metric'): Promise<OneCallData> => {
  try {
    const response = await axios.get(`${BASE_URL}/data/3.0/onecall`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units,
        exclude: 'minutely',
      },
    });
    
    // Translate weather descriptions in current weather
    if (response.data.current && response.data.current.weather && response.data.current.weather.length > 0) {
      response.data.current.weather[0].description = translateWeatherToVietnamese(response.data.current.weather[0].description);
      response.data.current.weather[0].main = translateWeatherMainToVietnamese(response.data.current.weather[0].main);
    }
    
    // Translate weather descriptions in hourly forecast
    if (response.data.hourly && response.data.hourly.length > 0) {
      response.data.hourly.forEach((hour: WeatherItem) => {
        if (hour.weather && hour.weather.length > 0) {
          hour.weather[0].description = translateWeatherToVietnamese(hour.weather[0].description);
          hour.weather[0].main = translateWeatherMainToVietnamese(hour.weather[0].main);
        }
      });
    }
    
    // Translate weather descriptions in daily forecast
    if (response.data.daily && response.data.daily.length > 0) {
      response.data.daily.forEach((day: WeatherItem) => {
        if (day.weather && day.weather.length > 0) {
          day.weather[0].description = translateWeatherToVietnamese(day.weather[0].description);
          day.weather[0].main = translateWeatherMainToVietnamese(day.weather[0].main);
        }
      });
    }
    
    // Translate alerts if available
    if (response.data.alerts && response.data.alerts.length > 0) {
      response.data.alerts.forEach((alert: Alert) => {
        alert.event = translateAlertToVietnamese(alert.event);
        alert.description = translateAlertDescriptionToVietnamese(alert.description);
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching one call data:', error);
    throw error;
  }
};

export const getCityAutocomplete = async (query: string): Promise<GeocodingData[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await axios.get(`${BASE_URL}/geo/1.0/direct`, {
      params: {
        q: query,
        limit: 5,
        appid: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    throw error;
  }
};

export const getWeatherIcon = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export const formatDate = (timestamp: number, format: 'full' | 'day' | 'time' | 'date' = 'full', timezoneOffset?: number): string => {
  // Sử dụng timezone từ API nếu có, nếu không sẽ dùng GMT+7 cho Việt Nam
  const offset = timezoneOffset !== undefined ? timezoneOffset : 25200; // 7 * 3600 seconds
  const date = new Date((timestamp + offset) * 1000);
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC', // Sử dụng UTC vì chúng ta đã thêm offset thủ công
    hour12: false // Sử dụng định dạng 24 giờ
  };
  
  if (format === 'day') {
    options.weekday = 'long';
  } else if (format === 'time') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  } else if (format === 'date') {
    options.day = 'numeric';
    options.month = 'numeric';
  } else {
    // Format đầy đủ
    options.weekday = 'long';
    options.year = 'numeric';
    options.month = 'long';
    options.day = 'numeric';
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('vi-VN', options).format(date);
};

export const kelvinToCelsius = (kelvin: number): number => {
  return Math.round(kelvin - 273.15);
};

export const kelvinToFahrenheit = (kelvin: number): number => {
  return Math.round((kelvin - 273.15) * 9/5 + 32);
};

// Các hình nền cho các điều kiện thời tiết khác nhau
const WEATHER_BACKGROUNDS = {
  // Thunderstorm
  thunderstorm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1974&auto=format&fit=crop',
  
  // Drizzle
  drizzle: 'https://images.unsplash.com/photo-1556485689-33e55ab56127?q=80&w=1974&auto=format&fit=crop',
  
  // Rain
  rain: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1935&auto=format&fit=crop',
  
  // Snow
  snow: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80&w=1983&auto=format&fit=crop',
  
  // Atmosphere (fog, mist, etc.)
  atmosphere: 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?q=80&w=1933&auto=format&fit=crop',
  
  // Clear day
  clearDay: 'https://images.unsplash.com/photo-1598717873846-a3cb339601a2?q=80&w=1974&auto=format&fit=crop',
  
  // Clear night
  clearNight: 'https://images.unsplash.com/photo-1532978379173-523e16f371f4?q=80&w=1974&auto=format&fit=crop',
  
  // Clouds day
  cloudsDay: 'https://images.unsplash.com/photo-1525920980995-f8a382bf42c5?q=80&w=1974&auto=format&fit=crop',
  
  // Clouds night
  cloudsNight: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1951&auto=format&fit=crop',
  
  // Default
  default: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1951&auto=format&fit=crop'
};

export const getWeatherBackground = (weatherId: number, isDay: boolean): string => {
  console.log(`Getting background for weather ID: ${weatherId}, isDay: ${isDay}`);
  
  // Weather condition codes: https://openweathermap.org/weather-conditions
  
  // Thunderstorm (200-299)
  if (weatherId >= 200 && weatherId < 300) {
    return WEATHER_BACKGROUNDS.thunderstorm;
  }
  
  // Drizzle (300-399)
  if (weatherId >= 300 && weatherId < 400) {
    return WEATHER_BACKGROUNDS.drizzle;
  }
  
  // Rain (500-599)
  if (weatherId >= 500 && weatherId < 600) {
    return WEATHER_BACKGROUNDS.rain;
  }
  
  // Snow (600-699)
  if (weatherId >= 600 && weatherId < 700) {
    return WEATHER_BACKGROUNDS.snow;
  }
  
  // Atmosphere (700-799) - fog, mist, etc.
  if (weatherId >= 700 && weatherId < 800) {
    return WEATHER_BACKGROUNDS.atmosphere;
  }
  
  // Clear (800)
  if (weatherId === 800) {
    return isDay 
      ? WEATHER_BACKGROUNDS.clearDay
      : WEATHER_BACKGROUNDS.clearNight;
  }
  
  // Clouds (801-899)
  if (weatherId > 800 && weatherId < 900) {
    return isDay
      ? WEATHER_BACKGROUNDS.cloudsDay
      : WEATHER_BACKGROUNDS.cloudsNight;
  }
  
  // Default
  return WEATHER_BACKGROUNDS.default;
};

// Bảng dịch các trạng thái thời tiết chính sang tiếng Việt
export const translateWeatherMainToVietnamese = (main: string): string => {
  const mainTranslations: Record<string, string> = {
    'Thunderstorm': 'Giông bão',
    'Drizzle': 'Mưa phùn',
    'Rain': 'Mưa',
    'Snow': 'Tuyết',
    'Mist': 'Sương mù',
    'Smoke': 'Khói',
    'Haze': 'Sương mờ',
    'Dust': 'Bụi',
    'Fog': 'Sương mù dày',
    'Sand': 'Cát',
    'Ash': 'Tro bụi',
    'Squall': 'Mưa đá',
    'Tornado': 'Lốc xoáy',
    'Clear': 'Trời quang',
    'Clouds': 'Có mây'
  };
  
  return mainTranslations[main] || main;
};

// Bảng dịch các mô tả thời tiết chi tiết sang tiếng Việt
export const translateWeatherToVietnamese = (description: string): string => {
  const descriptionTranslations: Record<string, string> = {
    // Thunderstorm
    'thunderstorm with light rain': 'Giông bão với mưa nhỏ',
    'thunderstorm with rain': 'Giông bão với mưa',
    'thunderstorm with heavy rain': 'Giông bão với mưa lớn',
    'light thunderstorm': 'Giông bão nhẹ',
    'thunderstorm': 'Giông bão',
    'heavy thunderstorm': 'Giông bão mạnh',
    'ragged thunderstorm': 'Giông bão rải rác',
    'thunderstorm with light drizzle': 'Giông bão với mưa phùn nhẹ',
    'thunderstorm with drizzle': 'Giông bão với mưa phùn',
    'thunderstorm with heavy drizzle': 'Giông bão với mưa phùn nặng hạt',
    
    // Drizzle
    'light intensity drizzle': 'Mưa phùn nhẹ',
    'drizzle': 'Mưa phùn',
    'heavy intensity drizzle': 'Mưa phùn nặng hạt',
    'light intensity drizzle rain': 'Mưa phùn nhẹ',
    'drizzle rain': 'Mưa phùn',
    'heavy intensity drizzle rain': 'Mưa phùn nặng hạt',
    'shower rain and drizzle': 'Mưa rào và mưa phùn',
    'heavy shower rain and drizzle': 'Mưa rào nặng hạt và mưa phùn',
    'shower drizzle': 'Mưa phùn rào',
    
    // Rain
    'light rain': 'Mưa nhỏ',
    'moderate rain': 'Mưa vừa',
    'heavy intensity rain': 'Mưa lớn',
    'very heavy rain': 'Mưa rất lớn',
    'extreme rain': 'Mưa cực lớn',
    'freezing rain': 'Mưa băng giá',
    'light intensity shower rain': 'Mưa rào nhẹ',
    'shower rain': 'Mưa rào',
    'heavy intensity shower rain': 'Mưa rào lớn',
    'ragged shower rain': 'Mưa rào rải rác',
    
    // Snow
    'light snow': 'Tuyết nhẹ',
    'snow': 'Tuyết',
    'heavy snow': 'Tuyết dày',
    'sleet': 'Mưa tuyết',
    'light shower sleet': 'Mưa tuyết rào nhẹ',
    'shower sleet': 'Mưa tuyết rào',
    'light rain and snow': 'Mưa nhỏ và tuyết',
    'rain and snow': 'Mưa và tuyết',
    'light shower snow': 'Tuyết rơi nhẹ',
    'shower snow': 'Tuyết rơi',
    'heavy shower snow': 'Tuyết rơi dày',
    
    // Atmosphere
    'mist': 'Sương mù',
    'smoke': 'Khói',
    'haze': 'Sương mờ',
    'sand/dust whirls': 'Xoáy cát/bụi',
    'fog': 'Sương mù dày',
    'sand': 'Cát',
    'dust': 'Bụi',
    'volcanic ash': 'Tro núi lửa',
    'squalls': 'Mưa đá',
    'tornado': 'Lốc xoáy',
    
    // Clear
    'clear sky': 'Trời quang đãng',
    
    // Clouds
    'few clouds': 'Ít mây',
    'scattered clouds': 'Mây rải rác',
    'broken clouds': 'Mây rải rác nhiều',
    'overcast clouds': 'Nhiều mây'
  };
  
  return descriptionTranslations[description.toLowerCase()] || description;
};

// Bảng dịch các cảnh báo thời tiết sang tiếng Việt
export const translateAlertToVietnamese = (alert: string): string => {
  const alertTranslations: Record<string, string> = {
    'Thunderstorm Warning': 'Cảnh báo giông bão',
    'Tornado Warning': 'Cảnh báo lốc xoáy',
    'Hurricane Warning': 'Cảnh báo bão',
    'Flood Warning': 'Cảnh báo lũ lụt',
    'Flash Flood Warning': 'Cảnh báo lũ quét',
    'Severe Weather': 'Thời tiết khắc nghiệt',
    'Winter Storm': 'Bão mùa đông',
    'Heat Advisory': 'Cảnh báo nắng nóng',
    'Frost Advisory': 'Cảnh báo sương giá',
    'Wind Advisory': 'Cảnh báo gió mạnh',
    'Dense Fog Advisory': 'Cảnh báo sương mù dày đặc',
    'Fire Weather': 'Thời tiết dễ cháy rừng',
    'Excessive Heat Warning': 'Cảnh báo nắng nóng quá mức',
    'Tropical Storm': 'Bão nhiệt đới'
  };
  
  return alertTranslations[alert] || alert;
};

// Bảng dịch mô tả cảnh báo thời tiết sang tiếng Việt
export const translateAlertDescriptionToVietnamese = (description: string): string => {
  // Đây chỉ là một số mẫu dịch, trong thực tế cần một hệ thống phức tạp hơn
  // để dịch các mô tả cảnh báo dài
  if (description.includes('thunderstorm')) {
    return description.replace('thunderstorm', 'giông bão');
  } else if (description.includes('tornado')) {
    return description.replace('tornado', 'lốc xoáy');
  } else if (description.includes('flood')) {
    return description.replace('flood', 'lũ lụt');
  }
  
  // Trả về mô tả gốc nếu không có bản dịch
  return description;
};
