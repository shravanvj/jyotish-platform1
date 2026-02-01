'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

type HoroscopeType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const rashis = [
  { id: 1, name: 'Aries', sanskrit: 'Mesha', symbol: '♈', element: 'Fire', ruler: 'Mars' },
  { id: 2, name: 'Taurus', sanskrit: 'Vrishabha', symbol: '♉', element: 'Earth', ruler: 'Venus' },
  { id: 3, name: 'Gemini', sanskrit: 'Mithuna', symbol: '♊', element: 'Air', ruler: 'Mercury' },
  { id: 4, name: 'Cancer', sanskrit: 'Karka', symbol: '♋', element: 'Water', ruler: 'Moon' },
  { id: 5, name: 'Leo', sanskrit: 'Simha', symbol: '♌', element: 'Fire', ruler: 'Sun' },
  { id: 6, name: 'Virgo', sanskrit: 'Kanya', symbol: '♍', element: 'Earth', ruler: 'Mercury' },
  { id: 7, name: 'Libra', sanskrit: 'Tula', symbol: '♎', element: 'Air', ruler: 'Venus' },
  { id: 8, name: 'Scorpio', sanskrit: 'Vrishchika', symbol: '♏', element: 'Water', ruler: 'Mars' },
  { id: 9, name: 'Sagittarius', sanskrit: 'Dhanu', symbol: '♐', element: 'Fire', ruler: 'Jupiter' },
  { id: 10, name: 'Capricorn', sanskrit: 'Makara', symbol: '♑', element: 'Earth', ruler: 'Saturn' },
  { id: 11, name: 'Aquarius', sanskrit: 'Kumbha', symbol: '♒', element: 'Air', ruler: 'Saturn' },
  { id: 12, name: 'Pisces', sanskrit: 'Meena', symbol: '♓', element: 'Water', ruler: 'Jupiter' },
];

interface HoroscopeData {
  general: string;
  love: string;
  career: string;
  health: string;
  finance: string;
  luckyNumber: number;
  luckyColor: string;
  luckyTime: string;
}

// Mock horoscope data generator
function getMockHoroscope(rashi: typeof rashis[0], type: HoroscopeType): HoroscopeData {
  return {
    general: `Today brings positive energy for ${rashi.name} natives. With ${rashi.ruler} influencing your chart, expect clarity in important decisions. Your natural ${rashi.element.toLowerCase()} element qualities will shine through.`,
    love: `Romantic relationships flourish today. Singles may find meaningful connections, while those in relationships will enjoy deeper understanding with their partners.`,
    career: `Professional matters look promising. Your hard work will be recognized, and new opportunities may present themselves. Trust your instincts in business dealings.`,
    health: `Focus on maintaining balance. Include gentle exercise and mindful eating. Your energy levels are stable, making it a good day for physical activities.`,
    finance: `Financial decisions should be made carefully today. Avoid impulsive purchases. A steady approach will bring better results in money matters.`,
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    luckyColor: ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'White', 'Pink'][Math.floor(Math.random() * 8)],
    luckyTime: ['Morning', 'Afternoon', 'Evening'][Math.floor(Math.random() * 3)],
  };
}

export default function HoroscopePage() {
  const [selectedRashi, setSelectedRashi] = useState<typeof rashis[0] | null>(null);
  const [horoscopeType, setHoroscopeType] = useState<HoroscopeType>('daily');
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeData | null>(null);

  const handleRashiSelect = (rashi: typeof rashis[0]) => {
    setSelectedRashi(rashi);
    setHoroscopeData(getMockHoroscope(rashi, horoscopeType));
  };

  const handleTypeChange = (type: HoroscopeType) => {
    setHoroscopeType(type);
    if (selectedRashi) {
      setHoroscopeData(getMockHoroscope(selectedRashi, type));
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Daily Horoscope
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Select your Moon Sign (Rashi) to get personalized predictions 
              based on Vedic astrology principles.
            </p>
          </div>

          {/* Horoscope Type Selector */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-lg border border-input overflow-hidden">
              {(['daily', 'weekly', 'monthly', 'yearly'] as HoroscopeType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium capitalize transition-colors',
                    horoscopeType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Rashi Grid */}
          <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {rashis.map((rashi) => (
              <button
                key={rashi.id}
                onClick={() => handleRashiSelect(rashi)}
                className={cn(
                  'card-vedic p-4 text-center transition-all hover:shadow-lg',
                  selectedRashi?.id === rashi.id && 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-950'
                )}
              >
                <div className="text-3xl mb-2">{rashi.symbol}</div>
                <div className="font-medium text-sm text-foreground">{rashi.name}</div>
                <div className="text-xs text-muted-foreground font-sanskrit">{rashi.sanskrit}</div>
              </button>
            ))}
          </div>

          {/* Horoscope Display */}
          {selectedRashi && horoscopeData && (
            <div className="mt-8">
              {/* Selected Rashi Header */}
              <div className="card-vedic p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedRashi.symbol}</div>
                  <div>
                    <h2 className="text-2xl font-display font-semibold text-foreground">
                      {selectedRashi.name}
                    </h2>
                    <p className="text-muted-foreground">
                      <span className="font-sanskrit">{selectedRashi.sanskrit}</span> • {selectedRashi.element} • Ruled by {selectedRashi.ruler}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-muted-foreground">
                      {horoscopeType.charAt(0).toUpperCase() + horoscopeType.slice(1)} Horoscope
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date().toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Predictions Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* General */}
                <div className="card-vedic p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3">
                    <span>✨</span> General
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {horoscopeData.general}
                  </p>
                </div>

                {/* Love */}
                <div className="card-vedic p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-pink-600 dark:text-pink-400 mb-3">
                    <span>💕</span> Love & Relationships
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {horoscopeData.love}
                  </p>
                </div>

                {/* Career */}
                <div className="card-vedic p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">
                    <span>💼</span> Career & Business
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {horoscopeData.career}
                  </p>
                </div>

                {/* Health */}
                <div className="card-vedic p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                    <span>🏥</span> Health & Wellness
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {horoscopeData.health}
                  </p>
                </div>

                {/* Finance */}
                <div className="card-vedic p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-3">
                    <span>💰</span> Finance & Money
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {horoscopeData.finance}
                  </p>
                </div>

                {/* Lucky */}
                <div className="card-vedic p-5 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-secondary-600 dark:text-secondary-400 mb-3">
                    <span>🍀</span> Lucky Factors
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                        {horoscopeData.luckyNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">Lucky Number</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-secondary-600 dark:text-secondary-400">
                        {horoscopeData.luckyColor}
                      </p>
                      <p className="text-xs text-muted-foreground">Lucky Color</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-secondary-600 dark:text-secondary-400">
                        {horoscopeData.luckyTime}
                      </p>
                      <p className="text-xs text-muted-foreground">Lucky Time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedRashi && (
            <div className="mt-16 text-center">
              <div className="text-6xl mb-4">🔮</div>
              <h3 className="text-lg font-medium text-foreground">Select Your Rashi</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose your Moon Sign from the grid above to view your horoscope
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
