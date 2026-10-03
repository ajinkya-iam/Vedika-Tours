import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { searchLocations } from '../../lib/routingService';

export default function LocationInput({
  label,
  placeholder,
  value,
  onSelectLocation,
  dotColor = 'bg-green-500',
  quickLocations = []
}) {
  const [query, setQuery] = useState(value ? value.name : '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    if (value) {
      setQuery(value.name);
    }
  }, [value]);

  // Click outside listener to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen || query.trim().length < 2 || (value && value.name === query)) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const results = await searchLocations(query);
      setSuggestions(results);
      setIsLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, isOpen, value]);

  const handleSelect = (loc) => {
    setQuery(loc.name);
    onSelectLocation(loc);
    setIsOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const locationName = data.address?.suburb || data.address?.city || data.display_name.split(',')[0] || 'Current Location';
          const loc = {
            name: locationName,
            displayName: data.display_name,
            lat: latitude,
            lng: longitude
          };
          handleSelect(loc);
        } catch (e) {
          handleSelect({
            name: 'Current Location',
            lat: latitude,
            lng: longitude
          });
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setIsLoading(false);
        alert('Could not access current location. Please check browser permissions.');
      }
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
          <span>{label}</span>
        </span>
        {label.toLowerCase().includes('pickup') && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-orange-600 hover:text-orange-700 text-[11px] font-medium flex items-center space-x-1 transition-colors"
          >
            <Navigation className="w-3 h-3" />
            <span>Use My Location</span>
          </button>
        )}
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <MapPin className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
        />

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Quick Picks for common travel routes */}
      {quickLocations.length > 0 && !value && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-[11px] text-gray-400 py-0.5">Quick:</span>
          {quickLocations.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(loc)}
              className="text-[11px] bg-orange-50 hover:bg-orange-100 text-orange-800 font-medium px-2 py-0.5 rounded-md transition-colors"
            >
              {loc.name}
            </button>
          ))}
        </div>
      )}

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto divide-y divide-gray-50">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-3 hover:bg-orange-50/60 flex items-start space-x-3 transition-colors group"
            >
              <MapPin className="w-4 h-4 text-gray-400 group-hover:text-orange-600 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {item.displayName}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
