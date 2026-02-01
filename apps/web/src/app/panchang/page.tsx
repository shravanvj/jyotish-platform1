'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn, formatDate, formatTime } from '@/lib/utils';

interface PanchangData {
  date: string;
  location: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  tithi: {
    name: string;
    paksha: string;
    endTime: string;
    deity: string;
  };
  nakshatra: {
    name: string;
    pada: number;
    endTime: string;
    ruler: string;
  };
  yoga: {
    name: string;
    endTime: string;
    nature: string;
  };
  karana: {
    name: string;
    endTime: string;
  };
  vara: {
    name: string;
    ruler: string;
  };
  rashi: {
    moon: string;
    sun: string;
  };
  auspicious: {
    abhijit: { start: string; end: string } | null;
    brahma: { start: string; end: string };
    amritKaal: { start: string; end: string };
  };
  inauspicious: {
    rahuKaal: { start: string; end: string };
    yamaganda: { start: string; end: string };
    gulikaKaal: { start: string; end: string };
  };
}

// Mock panchang data (would be replaced with API call)
function getMockPanchangData(date: Date, location: string): PanchangData {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const rulers = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  
  return {
    date: date.toISOString().split('T')[0],
    location,
    sunrise: '06:32 AM',
    sunset: '06:18 PM',
    moonrise: '08:45 PM',
    moonset: '07:23 AM',
    tithi: {
      name: 'Shukla Dashami',
      paksha: 'Shukla',
      endTime: '11:34 PM',
      deity: 'Dharmaraja',
    },
    nakshatra: {
      name: 'Uttara Phalguni',
      pada: 2,
      endTime: '03:21 AM (+1)',
      ruler: 'Sun',
    },
    yoga: {
      name: 'Siddha',
      endTime: '08:45 PM',
      nature: 'Auspicious',
    },
    karana: {
      name: 'Vanija',
      endTime: '11:34 PM',
    },
    vara: {
      name: weekdays[date.getDay()],
      ruler: rulers[date.getDay()],
    },
    rashi: {
      moon: 'Virgo (Kanya)',
      sun: 'Aquarius (Kumbha)',
    },
    auspicious: {
      abhijit: { start: '12:05 PM', end: '12:53 PM' },
      brahma: { start: '06:32 AM', end: '07:20 AM' },
      amritKaal: { start: '02:18 PM', end: '03:54 PM' },
    },
    inauspicious: {
      rahuKaal: { start: '04:30 PM', end: '06:00 PM' },
      yamaganda: { start: '12:00 PM', end: '01:30 PM' },
      gulikaKaal: { start: '03:00 PM', end: '04:30 PM' },
    },
  };
}

export default function PanchangPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location, setLocation] = useState('New Delhi, India');
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPanchang();
  }, [selectedDate, location]);

  const fetchPanchang = async () => {
    setIsLoading(true);
    try {
      // In production, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = getMockPanchangData(selectedDate, location);
      setPanchangData(data);
    } catch (error) {
      console.error('Failed to fetch panchang:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const InfoCard = ({ 
    title, 
    children, 
    className 
  }: { 
    title: string; 
    children: React.ReactNode; 
    className?: string;
  }) => (
    <div className={cn('card-vedic p-4', className)}>
      <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );

  const TimeSlot = ({ 
    label, 
    time, 
    variant = 'default' 
  }: { 
    label: string; 
    time: { start: string; end: string }; 
    variant?: 'auspicious' | 'inauspicious' | 'default';
  }) => (
    <div className="flex justify-between items-center py-2 border-b border-primary-100 dark:border-primary-900 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn(
        'text-sm font-medium',
        variant === 'auspicious' && 'text-green-600 dark:text-green-400',
        variant === 'inauspicious' && 'text-red-600 dark:text-red-400',
        variant === 'default' && 'text-foreground'
      )}>
        {time.start} - {time.end}
      </span>
    </div>
  );

  return (
    <>
      <Header />
      <main className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Daily Panchang
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Comprehensive Hindu calendar with tithi, nakshatra, yoga, karana, 
              and auspicious timings for your location.
            </p>
          </div>

          {/* Date Navigation */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Previous day"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="rounded-md border border-input px-4 py-2 text-sm bg-background"
              />
              
              <button
                onClick={() => navigateDate(1)}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Next day"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Today
            </button>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-md border border-input px-4 py-2 text-sm bg-background"
            >
              <option>New Delhi, India</option>
              <option>Mumbai, India</option>
              <option>Chennai, India</option>
              <option>Bangalore, India</option>
              <option>Kolkata, India</option>
            </select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-300 border-t-primary-600" />
            </div>
          )}

          {/* Panchang Content */}
          {panchangData && !isLoading && (
            <div className="mt-8">
              {/* Date Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-semibold text-foreground">
                  {formatDate(selectedDate, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-muted-foreground mt-1">{panchangData.location}</p>
              </div>

              {/* Main Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Sun & Moon Times */}
                <InfoCard title="☀️ Sun & Moon Times">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunrise</span>
                      <span className="font-medium">{panchangData.sunrise}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunset</span>
                      <span className="font-medium">{panchangData.sunset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moonrise</span>
                      <span className="font-medium">{panchangData.moonrise}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moonset</span>
                      <span className="font-medium">{panchangData.moonset}</span>
                    </div>
                  </div>
                </InfoCard>

                {/* Tithi */}
                <InfoCard title="🌙 Tithi">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{panchangData.tithi.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paksha</span>
                      <span className="font-medium">{panchangData.tithi.paksha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ends at</span>
                      <span className="font-medium">{panchangData.tithi.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deity</span>
                      <span className="font-medium">{panchangData.tithi.deity}</span>
                    </div>
                  </div>
                </InfoCard>

                {/* Nakshatra */}
                <InfoCard title="⭐ Nakshatra">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{panchangData.nakshatra.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pada</span>
                      <span className="font-medium">{panchangData.nakshatra.pada}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ends at</span>
                      <span className="font-medium">{panchangData.nakshatra.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ruler</span>
                      <span className="font-medium">{panchangData.nakshatra.ruler}</span>
                    </div>
                  </div>
                </InfoCard>

                {/* Yoga & Karana */}
                <InfoCard title="🕉️ Yoga & Karana">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yoga</span>
                      <span className="font-medium">{panchangData.yoga.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yoga ends</span>
                      <span className="font-medium">{panchangData.yoga.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Karana</span>
                      <span className="font-medium">{panchangData.karana.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Karana ends</span>
                      <span className="font-medium">{panchangData.karana.endTime}</span>
                    </div>
                  </div>
                </InfoCard>

                {/* Vara & Rashi */}
                <InfoCard title="📆 Vara & Rashi">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vara (Day)</span>
                      <span className="font-medium">{panchangData.vara.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Day Lord</span>
                      <span className="font-medium">{panchangData.vara.ruler}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moon Sign</span>
                      <span className="font-medium">{panchangData.rashi.moon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sun Sign</span>
                      <span className="font-medium">{panchangData.rashi.sun}</span>
                    </div>
                  </div>
                </InfoCard>

                {/* Auspicious Times */}
                <InfoCard title="✅ Auspicious Times" className="bg-green-50/50 dark:bg-green-950/20">
                  {panchangData.auspicious.abhijit && (
                    <TimeSlot 
                      label="Abhijit Muhurat" 
                      time={panchangData.auspicious.abhijit} 
                      variant="auspicious" 
                    />
                  )}
                  <TimeSlot 
                    label="Brahma Muhurat" 
                    time={panchangData.auspicious.brahma} 
                    variant="auspicious" 
                  />
                  <TimeSlot 
                    label="Amrit Kaal" 
                    time={panchangData.auspicious.amritKaal} 
                    variant="auspicious" 
                  />
                </InfoCard>

                {/* Inauspicious Times */}
                <InfoCard title="⚠️ Inauspicious Times" className="bg-red-50/50 dark:bg-red-950/20 md:col-span-2 lg:col-span-1">
                  <TimeSlot 
                    label="Rahu Kaal" 
                    time={panchangData.inauspicious.rahuKaal} 
                    variant="inauspicious" 
                  />
                  <TimeSlot 
                    label="Yamaganda" 
                    time={panchangData.inauspicious.yamaganda} 
                    variant="inauspicious" 
                  />
                  <TimeSlot 
                    label="Gulika Kaal" 
                    time={panchangData.inauspicious.gulikaKaal} 
                    variant="inauspicious" 
                  />
                </InfoCard>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
