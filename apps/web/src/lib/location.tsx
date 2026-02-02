'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks';

// Major Indian cities with coordinates
export const INDIAN_CITIES = [
  { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, tz: 'Asia/Kolkata' },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, tz: 'Asia/Kolkata' },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, tz: 'Asia/Kolkata' },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, tz: 'Asia/Kolkata' },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, tz: 'Asia/Kolkata' },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, tz: 'Asia/Kolkata' },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, tz: 'Asia/Kolkata' },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, tz: 'Asia/Kolkata' },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, tz: 'Asia/Kolkata' },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, tz: 'Asia/Kolkata' },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, tz: 'Asia/Kolkata' },
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, tz: 'Asia/Kolkata' },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, tz: 'Asia/Kolkata' },
  { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781, tz: 'Asia/Kolkata' },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, tz: 'Asia/Kolkata' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, tz: 'Asia/Kolkata' },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, tz: 'Asia/Kolkata' },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, tz: 'Asia/Kolkata' },
];

// International cities
export const WORLD_CITIES = [
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, tz: 'Asia/Dubai' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, tz: 'America/Toronto' },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
  { name: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194, tz: 'America/Los_Angeles' },
  { name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, tz: 'Asia/Hong_Kong' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, tz: 'Asia/Tokyo' },
];

export interface PlaceResult {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneOffset: number;
}

interface UsePlaceSearchOptions {
  debounceMs?: number;
  minChars?: number;
}

/**
 * Hook for searching places with autocomplete
 */
export function usePlaceSearch(options: UsePlaceSearchOptions = {}) {
  const { debounceMs = 300, minChars = 2 } = options;
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, debounceMs);
  
  // Search local cities first, then API if needed
  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minChars) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const normalizedQuery = searchQuery.toLowerCase();
      
      // Search Indian cities
      const indianMatches = INDIAN_CITIES
        .filter(city => 
          city.name.toLowerCase().includes(normalizedQuery) ||
          city.state.toLowerCase().includes(normalizedQuery)
        )
        .map(city => ({
          name: city.name,
          displayName: `${city.name}, ${city.state}, India`,
          latitude: city.lat,
          longitude: city.lng,
          timezone: city.tz,
          timezoneOffset: 5.5, // IST
        }));
      
      // Search world cities
      const worldMatches = WORLD_CITIES
        .filter(city => 
          city.name.toLowerCase().includes(normalizedQuery) ||
          city.country.toLowerCase().includes(normalizedQuery)
        )
        .map(city => ({
          name: city.name,
          displayName: `${city.name}, ${city.country}`,
          latitude: city.lat,
          longitude: city.lng,
          timezone: city.tz,
          timezoneOffset: getTimezoneOffset(city.tz),
        }));
      
      const localResults = [...indianMatches, ...worldMatches].slice(0, 10);
      
      if (localResults.length > 0) {
        setResults(localResults);
      } else {
        // Could call external API here (Google Places, Nominatim, etc.)
        setResults([]);
      }
    } catch (err) {
      setError('Failed to search places');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [minChars]);
  
  // Trigger search when debounced query changes
  useEffect(() => {
    searchPlaces(debouncedQuery);
  }, [debouncedQuery, searchPlaces]);
  
  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearResults: () => setResults([]),
  };
}

/**
 * Get timezone offset in hours for a timezone name
 */
function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  } catch {
    return 0;
  }
}

/**
 * Get timezone name from coordinates using browser API
 */
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

/**
 * Calculate distance between two coordinates (in km)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * PlaceAutocomplete component
 */
interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export function PlaceAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search for a place...',
  className = '',
  error,
}: PlaceAutocompleteProps) {
  const { query, setQuery, results, isLoading, clearResults } = usePlaceSearch();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Sync external value with internal query
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);
  
  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);
    setIsOpen(true);
  };
  
  const handleSelect = (place: PlaceResult) => {
    onChange(place.displayName);
    onSelect(place);
    setIsOpen(false);
    clearResults();
  };
  
  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={`block w-full rounded-md border px-4 py-2.5 text-sm
          border-input bg-background placeholder:text-muted-foreground
          focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
          ${error ? 'border-destructive' : ''}`}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      )}
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg max-h-60 overflow-auto">
          {results.map((place, index) => (
            <button
              key={`${place.name}-${index}`}
              type="button"
              onClick={() => handleSelect(place)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
            >
              <div className="font-medium text-foreground">{place.name}</div>
              <div className="text-xs text-muted-foreground">{place.displayName}</div>
            </button>
          ))}
        </div>
      )}
      
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
