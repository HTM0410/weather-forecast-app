import { useState, useEffect } from 'react';
import { Cloud, MapPin, Search } from 'lucide-react';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeather } from './hooks/useWeather';
import { getWeatherBackground } from './services/weatherService';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import DailyForecast from './components/DailyForecast';
import HourlyForecast from './components/HourlyForecast';
import WeatherAlerts from './components/WeatherAlerts';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

// Vị trí mặc định (Hà Nội)
const DEFAULT_LOCATION = {
  lat: 21.0285,
  lon: 105.8542,
  name: 'Hà Nội'
};

function App() {
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number | null;
    lon: number | null;
    name: string | null;
  }>({
    lat: null,
    lon: null,
    name: null,
  });
  const [backgroundImage, setBackgroundImage] = useState<string>('https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1951&auto=format&fit=crop');

  const { loading: geoLoading, error: geoError, position, permissionDenied } = useGeolocation();
  
  // Sử dụng vị trí mặc định nếu quyền truy cập vị trí bị từ chối
  useEffect(() => {
    if (permissionDenied && !selectedLocation.lat && !selectedLocation.lon) {
      setSelectedLocation({
        lat: DEFAULT_LOCATION.lat,
        lon: DEFAULT_LOCATION.lon,
        name: DEFAULT_LOCATION.name,
      });
    }
  }, [permissionDenied, selectedLocation]);

  const { 
    loading: weatherLoading, 
    error: weatherError, 
    currentWeather, 
    oneCallData 
  } = useWeather(
    selectedLocation.lat !== null ? selectedLocation.lat : position?.lat || null,
    selectedLocation.lon !== null ? selectedLocation.lon : position?.lon || null,
    units
  );

  // Update background image when weather data changes
  useEffect(() => {
    if (currentWeather) {
      const isDay = currentWeather.dt > currentWeather.sys.sunrise && currentWeather.dt < currentWeather.sys.sunset;
      const newBackground = getWeatherBackground(currentWeather.weather[0].id, isDay);
      console.log('Weather ID:', currentWeather.weather[0].id, 'Is Day:', isDay, 'New Background:', newBackground);
      setBackgroundImage(newBackground);
    }
  }, [currentWeather]);

  useEffect(() => {
    if (position && !selectedLocation.lat && !selectedLocation.lon) {
      setSelectedLocation({
        lat: position.lat,
        lon: position.lon,
        name: 'Vị trí hiện tại',
      });
    }
  }, [position, selectedLocation]);

  const handleCitySelect = (lat: number, lon: number, cityName: string) => {
    setSelectedLocation({ lat, lon, name: cityName });
  };

  const toggleUnits = () => {
    setUnits(prev => prev === 'metric' ? 'imperial' : 'metric');
  };

  const handleUseCurrentLocation = () => {
    if (position) {
      setSelectedLocation({
        lat: position.lat,
        lon: position.lon,
        name: 'Vị trí hiện tại',
      });
    }
  };

  const loading = geoLoading || weatherLoading;
  const error = weatherError || (geoError && !permissionDenied ? geoError : null);

  console.log('Current background image:', backgroundImage);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col transition-all duration-1000"
      style={{ backgroundImage: `url("${backgroundImage}")` }}
    >
      <div className="bg-gradient-to-b from-black/50 to-black/30 min-h-screen py-8 px-4">
        <header className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center mb-6">
            <Cloud className="text-white mr-2" size={32} />
            <h1 className="text-3xl font-bold text-white">Dự Báo Thời Tiết</h1>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-2xl">
              <SearchBar onCitySelect={handleCitySelect} />
            </div>
            
            {position && (
              <button 
                onClick={handleUseCurrentLocation}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <MapPin size={18} className="mr-1" />
                <span>Vị trí hiện tại</span>
              </button>
            )}
          </div>

          {permissionDenied && (
            <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded max-w-2xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Search className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    Bạn đã từ chối quyền truy cập vị trí. Đang hiển thị thời tiết cho {DEFAULT_LOCATION.name}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="max-w-2xl mx-auto">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            currentWeather && oneCallData && (
              <>
                <CurrentWeather 
                  data={currentWeather} 
                  units={units} 
                  onToggleUnits={toggleUnits} 
                />
                <HourlyForecast data={oneCallData} units={units} />
                <DailyForecast data={oneCallData} units={units} />
                <WeatherAlerts data={oneCallData} />
              </>
            )
          )}
        </main>

        <footer className="mt-12 text-center text-white text-sm">
          <p>Dữ liệu thời tiết được cung cấp bởi OpenWeatherMap</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
