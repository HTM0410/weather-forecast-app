import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { getCityAutocomplete } from '../services/weatherService';
import { GeocodingData } from '../types/weather';

interface SearchBarProps {
  onCitySelect: (lat: number, lon: number, cityName: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onCitySelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getCityAutocomplete(query);
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleCitySelect = (city: GeocodingData) => {
    onCitySelect(city.lat, city.lon, city.name);
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="w-full relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Tìm kiếm thành phố..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </div>
      </div>

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">Đang tìm kiếm...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((city, index) => (
                <li
                  key={`${city.name}-${city.lat}-${city.lon}-${index}`}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCitySelect(city)}
                >
                  {city.name}, {city.state ? `${city.state}, ` : ''}{city.country}
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-3 text-center text-gray-500">Không tìm thấy thành phố</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
