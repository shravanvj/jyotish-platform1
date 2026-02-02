'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const birthDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  timeOfBirth: z.string().min(1, 'Time of birth is required'),
  location: z.string().min(1, 'Birth location is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().optional(),
  ayanamsa: z.enum(['lahiri', 'raman', 'krishnamurti', 'true_chitrapaksha']).default('lahiri'),
});

type BirthDataFormValues = z.infer<typeof birthDataSchema>;

// Export the type for use in other components
export type BirthFormData = BirthDataFormValues;

interface BirthDataFormProps {
  onSubmit: (data: BirthDataFormValues) => void;
  isLoading?: boolean;
  defaultValues?: Partial<BirthDataFormValues>;
  submitLabel?: string;
  showName?: boolean;
}

// Popular cities for quick selection
const POPULAR_LOCATIONS = [
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090, tz: 'Asia/Kolkata' },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'Chennai, India', lat: 13.0827, lng: 80.2707, tz: 'Asia/Kolkata' },
  { name: 'Bangalore, India', lat: 12.9716, lng: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639, tz: 'Asia/Kolkata' },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
];

export function BirthDataForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitLabel = 'Generate Chart',
  showName = true,
}: BirthDataFormProps) {
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<typeof POPULAR_LOCATIONS>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BirthDataFormValues>({
    resolver: zodResolver(birthDataSchema),
    defaultValues: {
      ayanamsa: 'lahiri',
      ...defaultValues,
    },
  });

  const locationValue = watch('location');

  const handleLocationSearch = (value: string) => {
    if (value.length > 2) {
      const filtered = POPULAR_LOCATIONS.filter((loc) =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleLocationSelect = (location: typeof POPULAR_LOCATIONS[0]) => {
    setValue('location', location.name);
    setValue('latitude', location.lat);
    setValue('longitude', location.lng);
    setValue('timezone', location.tz);
    setLocationSuggestions([]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {showName && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="Enter name"
            className={cn(
              'mt-1 block w-full rounded-md border px-3 py-2 text-sm',
              'border-input bg-background placeholder:text-muted-foreground',
              'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              errors.name && 'border-destructive'
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground">
            Date of Birth
          </label>
          <input
            {...register('dateOfBirth')}
            type="date"
            id="dateOfBirth"
            className={cn(
              'mt-1 block w-full rounded-md border px-3 py-2 text-sm',
              'border-input bg-background',
              'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              errors.dateOfBirth && 'border-destructive'
            )}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-destructive">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="timeOfBirth" className="block text-sm font-medium text-foreground">
            Time of Birth
          </label>
          <input
            {...register('timeOfBirth')}
            type="time"
            id="timeOfBirth"
            className={cn(
              'mt-1 block w-full rounded-md border px-3 py-2 text-sm',
              'border-input bg-background',
              'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              errors.timeOfBirth && 'border-destructive'
            )}
          />
          {errors.timeOfBirth && (
            <p className="mt-1 text-sm text-destructive">{errors.timeOfBirth.message}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Use 24-hour format. Accurate birth time improves chart precision.
          </p>
        </div>
      </div>

      <div className="relative">
        <label htmlFor="location" className="block text-sm font-medium text-foreground">
          Birth Location
        </label>
        <input
          {...register('location', {
            onChange: (e) => handleLocationSearch(e.target.value),
          })}
          type="text"
          id="location"
          placeholder="Start typing city name..."
          autoComplete="off"
          className={cn(
            'mt-1 block w-full rounded-md border px-3 py-2 text-sm',
            'border-input bg-background placeholder:text-muted-foreground',
            'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
            errors.location && 'border-destructive'
          )}
        />
        {errors.location && (
          <p className="mt-1 text-sm text-destructive">{errors.location.message}</p>
        )}
        
        {/* Location suggestions dropdown */}
        {locationSuggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background shadow-lg">
            {locationSuggestions.map((loc) => (
              <li key={loc.name}>
                <button
                  type="button"
                  onClick={() => handleLocationSelect(loc)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {loc.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        
        <button
          type="button"
          onClick={() => setShowManualCoords(!showManualCoords)}
          className="mt-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          {showManualCoords ? 'Hide manual coordinates' : 'Enter coordinates manually'}
        </button>
      </div>

      {showManualCoords && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-foreground">
              Latitude
            </label>
            <input
              {...register('latitude', { valueAsNumber: true })}
              type="number"
              step="0.0001"
              id="latitude"
              placeholder="28.6139"
              className={cn(
                'mt-1 block w-full rounded-md border px-3 py-2 text-sm',
                'border-input bg-background placeholder:text-muted-foreground',
                'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
              )}
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-foreground">
              Longitude
            </label>
            <input
              {...register('longitude', { valueAsNumber: true })}
              type="number"
              step="0.0001"
              id="longitude"
              placeholder="77.2090"
              className={cn(
                'mt-1 block w-full rounded-md border px-3 py-2 text-sm',
                'border-input bg-background placeholder:text-muted-foreground',
                'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
              )}
            />
          </div>
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-foreground">
              Timezone
            </label>
            <input
              {...register('timezone')}
              type="text"
              id="timezone"
              placeholder="Asia/Kolkata"
              className={cn(
                'mt-1 block w-full rounded-md border px-3 py-2 text-sm',
                'border-input bg-background placeholder:text-muted-foreground',
                'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
              )}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="ayanamsa" className="block text-sm font-medium text-foreground">
          Ayanamsa
        </label>
        <select
          {...register('ayanamsa')}
          id="ayanamsa"
          className={cn(
            'mt-1 block w-full rounded-md border px-3 py-2 text-sm',
            'border-input bg-background',
            'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
          )}
        >
          <option value="lahiri">Lahiri (Chitrapaksha)</option>
          <option value="raman">Raman</option>
          <option value="krishnamurti">Krishnamurti (KP)</option>
          <option value="true_chitrapaksha">True Chitrapaksha</option>
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Lahiri is the most commonly used ayanamsa in Vedic astrology.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          'w-full rounded-md px-4 py-3 text-sm font-semibold text-white',
          'bg-primary-600 hover:bg-primary-700 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Calculating...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
