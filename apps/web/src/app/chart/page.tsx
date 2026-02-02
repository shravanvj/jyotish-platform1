'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BirthDataForm } from '@/components/forms/birth-data-form';
import { SouthIndianChart } from '@/components/charts/south-indian-chart';
import { NorthIndianChart } from '@/components/charts/north-indian-chart';
import { cn, formatDegrees, getNakshatra, getZodiacSign } from '@/lib/utils';

type ChartStyle = 'south' | 'north';

interface ChartData {
  ascendant: number;
  planets: Array<{
    name: string;
    longitude: number;
    house: number;
    isRetrograde: boolean;
  }>;
  houses: number[];
  ayanamsa: string;
  ayanamsaValue: number;
}

// Mock chart calculation (would be replaced with API call)
function mockCalculateChart(data: any): ChartData {
  // This is placeholder data - in production, this would call the API
  const ascendant = 145.5; // Leo ascendant
  
  return {
    ascendant,
    ayanamsa: data.ayanamsa,
    ayanamsaValue: 24.1234,
    houses: [
      145.5, 175.5, 205.5, 235.5, 265.5, 295.5,
      325.5, 355.5, 25.5, 55.5, 85.5, 115.5
    ],
    planets: [
      { name: 'Sun', longitude: 125.75, house: 1, isRetrograde: false },
      { name: 'Moon', longitude: 235.42, house: 4, isRetrograde: false },
      { name: 'Mars', longitude: 185.21, house: 2, isRetrograde: false },
      { name: 'Mercury', longitude: 138.67, house: 1, isRetrograde: true },
      { name: 'Jupiter', longitude: 340.89, house: 8, isRetrograde: false },
      { name: 'Venus', longitude: 98.45, house: 12, isRetrograde: false },
      { name: 'Saturn', longitude: 295.33, house: 6, isRetrograde: true },
      { name: 'Rahu', longitude: 52.11, house: 10, isRetrograde: true },
      { name: 'Ketu', longitude: 232.11, house: 4, isRetrograde: true },
    ],
  };
}

export default function ChartPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartStyle, setChartStyle] = useState<ChartStyle>('south');
  const [isLoading, setIsLoading] = useState(false);
  const [showDegrees, setShowDegrees] = useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // In production, this would be an API call:
      // const response = await fetch('/api/v1/charts/birth', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      // });
      // const chartData = await response.json();
      
      // Mock delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const result = mockCalculateChart(data);
      setChartData(result);
    } catch (error) {
      console.error('Failed to calculate chart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Birth Chart Calculator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Generate your complete Vedic birth chart with planetary positions, 
              house placements, and detailed interpretations.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Form Section */}
            <div className="card-vedic p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Enter Birth Details
              </h2>
              <BirthDataForm 
                onSubmit={handleFormSubmit} 
                isLoading={isLoading}
                showName={true}
              />
            </div>

            {/* Chart Display Section */}
            <div className="card-vedic p-6">
              {chartData ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      Your Birth Chart
                    </h2>
                    <div className="flex items-center gap-4">
                      {/* Chart style toggle */}
                      <div className="flex rounded-md border border-input overflow-hidden">
                        <button
                          onClick={() => setChartStyle('south')}
                          className={cn(
                            'px-3 py-1 text-xs font-medium transition-colors',
                            chartStyle === 'south'
                              ? 'bg-primary-600 text-white'
                              : 'bg-background text-muted-foreground hover:bg-muted'
                          )}
                        >
                          South Indian
                        </button>
                        <button
                          onClick={() => setChartStyle('north')}
                          className={cn(
                            'px-3 py-1 text-xs font-medium transition-colors',
                            chartStyle === 'north'
                              ? 'bg-primary-600 text-white'
                              : 'bg-background text-muted-foreground hover:bg-muted'
                          )}
                        >
                          North Indian
                        </button>
                      </div>
                      
                      {/* Show degrees toggle */}
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={showDegrees}
                          onChange={(e) => setShowDegrees(e.target.checked)}
                          className="rounded border-input"
                        />
                        Show degrees
                      </label>
                    </div>
                  </div>

                  {/* Chart visualization */}
                  {chartStyle === 'south' ? (
                    <SouthIndianChart
                      planets={chartData.planets}
                      ascendant={chartData.ascendant}
                      showDegrees={showDegrees}
                    />
                  ) : (
                    <NorthIndianChart
                      planets={chartData.planets}
                      ascendant={chartData.ascendant}
                      showDegrees={showDegrees}
                    />
                  )}
                </>
              ) : (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-4">🪐</div>
                  <h3 className="text-lg font-medium text-foreground">
                    No Chart Generated
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enter your birth details to generate your Vedic birth chart
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Planetary Details Table */}
          {chartData && (
            <div className="mt-8 card-vedic p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Planetary Positions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-200 dark:border-primary-800">
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Planet</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Sign</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Degree</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Nakshatra</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Pada</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">House</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.planets.map((planet) => {
                      const signResult = getZodiacSign(planet.longitude) as { sign: string; degreeInSign: number };
                      const nakshatraResult = getNakshatra(planet.longitude) as { nakshatra: string; pada: number };
                      
                      return (
                        <tr 
                          key={planet.name}
                          className="border-b border-primary-100 dark:border-primary-900 hover:bg-muted/50"
                        >
                          <td className="py-3 px-4 font-medium">{planet.name}</td>
                          <td className="py-3 px-4">{signResult.sign}</td>
                          <td className="py-3 px-4">{formatDegrees(signResult.degreeInSign)}</td>
                          <td className="py-3 px-4">{nakshatraResult.nakshatra}</td>
                          <td className="py-3 px-4">{nakshatraResult.pada}</td>
                          <td className="py-3 px-4">{planet.house}</td>
                          <td className="py-3 px-4">
                            {planet.isRetrograde ? (
                              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Retrograde
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                Direct
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Ayanamsa: {chartData.ayanamsa} ({chartData.ayanamsaValue.toFixed(4)}°)</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
