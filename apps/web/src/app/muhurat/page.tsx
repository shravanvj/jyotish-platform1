'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

type EventType = 
  | 'marriage'
  | 'griha_pravesh'
  | 'vehicle_purchase'
  | 'business_start'
  | 'travel'
  | 'education'
  | 'property'
  | 'medical'
  | 'naming_ceremony'
  | 'mundan';

interface MuhuratResult {
  date: string;
  startTime: string;
  endTime: string;
  quality: 'excellent' | 'good' | 'average';
  tithi: string;
  nakshatra: string;
  yoga: string;
  weekday: string;
  remarks: string;
}

const eventTypes: { id: EventType; name: string; icon: string; description: string }[] = [
  { id: 'marriage', name: 'Marriage', icon: '💍', description: 'Vivah Muhurat for wedding ceremony' },
  { id: 'griha_pravesh', name: 'Griha Pravesh', icon: '🏠', description: 'House warming ceremony' },
  { id: 'vehicle_purchase', name: 'Vehicle Purchase', icon: '🚗', description: 'Buying new vehicle' },
  { id: 'business_start', name: 'Business Start', icon: '💼', description: 'Starting new business or venture' },
  { id: 'travel', name: 'Travel', icon: '✈️', description: 'Long journey or relocation' },
  { id: 'education', name: 'Education', icon: '📚', description: 'Starting new course or learning' },
  { id: 'property', name: 'Property Purchase', icon: '🏢', description: 'Buying land or property' },
  { id: 'medical', name: 'Medical Procedure', icon: '🏥', description: 'Surgery or medical treatment' },
  { id: 'naming_ceremony', name: 'Naming Ceremony', icon: '👶', description: 'Namkaran Sanskar' },
  { id: 'mundan', name: 'Mundan', icon: '✂️', description: 'First haircut ceremony' },
];

const locations = [
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
];

// Mock muhurat generator
function generateMockMuhurats(eventType: EventType, startDate: Date, endDate: Date): MuhuratResult[] {
  const results: MuhuratResult[] = [];
  const currentDate = new Date(startDate);
  
  const tithis = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'];
  const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  const yogas = ['Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const qualities: ('excellent' | 'good' | 'average')[] = ['excellent', 'good', 'average'];
  
  while (currentDate <= endDate && results.length < 10) {
    // Random chance of having a muhurat on this day (30%)
    if (Math.random() > 0.7) {
      const dayOfWeek = currentDate.getDay();
      const quality = qualities[Math.floor(Math.random() * qualities.length)];
      
      const startHour = 6 + Math.floor(Math.random() * 10);
      const startMin = Math.floor(Math.random() * 4) * 15;
      const duration = 1 + Math.floor(Math.random() * 3);
      
      results.push({
        date: currentDate.toISOString().split('T')[0],
        startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
        endTime: `${(startHour + duration).toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
        quality,
        tithi: tithis[Math.floor(Math.random() * tithis.length)],
        nakshatra: nakshatras[Math.floor(Math.random() * nakshatras.length)],
        yoga: yogas[Math.floor(Math.random() * yogas.length)],
        weekday: weekdays[dayOfWeek],
        remarks: quality === 'excellent' 
          ? 'Highly auspicious timing with favorable planetary alignments'
          : quality === 'good'
          ? 'Good muhurat with positive influences'
          : 'Acceptable muhurat with some considerations',
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return results;
}

export default function MuhuratPage() {
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [location, setLocation] = useState(locations[0].name);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  });
  const [results, setResults] = useState<MuhuratResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (!selectedEvent) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const muhurats = generateMockMuhurats(
        selectedEvent,
        new Date(startDate),
        new Date(endDate)
      );
      setResults(muhurats);
      setIsLoading(false);
    }, 800);
  };

  const selectedEventInfo = eventTypes.find(e => e.id === selectedEvent);

  return (
    <>
      <Header />
      <main className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Muhurat Finder
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Find auspicious timings for important life events based on Vedic 
              panchang calculations and planetary positions.
            </p>
          </div>

          {/* Event Type Selector */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-foreground mb-4">Select Event Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {eventTypes.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className={cn(
                    'card-vedic p-4 text-center transition-all hover:shadow-lg',
                    selectedEvent === event.id && 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-950'
                  )}
                >
                  <div className="text-2xl mb-2">{event.icon}</div>
                  <div className="font-medium text-sm text-foreground">{event.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          {selectedEvent && (
            <div className="mt-8 card-vedic p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{selectedEventInfo?.icon}</span>
                <div>
                  <h3 className="font-medium text-foreground">{selectedEventInfo?.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEventInfo?.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {locations.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Searching...' : 'Find Muhurats'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Auspicious Muhurats Found ({results.length})
              </h2>
              <div className="space-y-4">
                {results.map((muhurat, index) => (
                  <div
                    key={index}
                    className={cn(
                      'card-vedic p-5',
                      muhurat.quality === 'excellent' && 'border-l-4 border-l-green-500',
                      muhurat.quality === 'good' && 'border-l-4 border-l-blue-500',
                      muhurat.quality === 'average' && 'border-l-4 border-l-yellow-500'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            muhurat.quality === 'excellent' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                            muhurat.quality === 'good' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                            muhurat.quality === 'average' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          )}>
                            {muhurat.quality.charAt(0).toUpperCase() + muhurat.quality.slice(1)}
                          </span>
                          <h3 className="font-medium text-foreground">
                            {new Date(muhurat.date).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-primary-600 dark:text-primary-400 font-medium">
                          {muhurat.startTime} - {muhurat.endTime}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center sm:text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Tithi</p>
                          <p className="text-sm font-medium text-foreground">{muhurat.tithi}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Nakshatra</p>
                          <p className="text-sm font-medium text-foreground">{muhurat.nakshatra}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Yoga</p>
                          <p className="text-sm font-medium text-foreground">{muhurat.yoga}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-sm text-muted-foreground">
                      {muhurat.remarks}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedEvent && results.length === 0 && !isLoading && (
            <div className="mt-16 text-center">
              <div className="text-6xl mb-4">🗓️</div>
              <h3 className="text-lg font-medium text-foreground">No Muhurats Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Click "Find Muhurats" to search for auspicious timings in the selected date range
              </p>
            </div>
          )}

          {/* Initial Empty State */}
          {!selectedEvent && (
            <div className="mt-16 text-center">
              <div className="text-6xl mb-4">🕉️</div>
              <h3 className="text-lg font-medium text-foreground">Select an Event Type</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose the type of event above to find auspicious timings
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
