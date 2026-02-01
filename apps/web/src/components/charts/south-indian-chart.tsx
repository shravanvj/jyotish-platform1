'use client';

import { cn, getPlanetAbbr, planetColors } from '@/lib/utils';

interface Planet {
  name: string;
  longitude: number;
  house: number;
  isRetrograde?: boolean;
}

interface SouthIndianChartProps {
  planets: Planet[];
  ascendant: number;
  className?: string;
  showDegrees?: boolean;
  highlightHouse?: number;
}

// South Indian chart house positions (fixed signs)
// The layout is a 4x4 grid with center 2x2 empty
// Houses are mapped to fixed zodiac signs starting from Aries
const HOUSE_POSITIONS: Record<number, { row: number; col: number }> = {
  // Row 0 (top): Pisces, Aries, Taurus, Gemini
  12: { row: 0, col: 0 },
  1: { row: 0, col: 1 },
  2: { row: 0, col: 2 },
  3: { row: 0, col: 3 },
  // Row 1: Aquarius, (center), (center), Cancer
  11: { row: 1, col: 0 },
  4: { row: 1, col: 3 },
  // Row 2: Capricorn, (center), (center), Leo
  10: { row: 2, col: 0 },
  5: { row: 2, col: 3 },
  // Row 3 (bottom): Sagittarius, Scorpio, Libra, Virgo
  9: { row: 3, col: 0 },
  8: { row: 3, col: 1 },
  7: { row: 3, col: 2 },
  6: { row: 3, col: 3 },
};

const SIGN_NAMES = [
  '', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_SYMBOLS = [
  '', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'
];

export function SouthIndianChart({
  planets,
  ascendant,
  className,
  showDegrees = false,
  highlightHouse,
}: SouthIndianChartProps) {
  // Calculate ascendant sign (1-12)
  const ascSign = Math.floor(ascendant / 30) + 1;
  
  // Group planets by their zodiac sign
  const planetsBySign: Record<number, Planet[]> = {};
  planets.forEach((planet) => {
    const sign = Math.floor(planet.longitude / 30) + 1;
    if (!planetsBySign[sign]) {
      planetsBySign[sign] = [];
    }
    planetsBySign[sign].push(planet);
  });

  // Calculate house number from sign (relative to ascendant)
  const getHouseFromSign = (sign: number): number => {
    let house = sign - ascSign + 1;
    if (house <= 0) house += 12;
    return house;
  };

  const renderHouse = (sign: number) => {
    const house = getHouseFromSign(sign);
    const planetsInSign = planetsBySign[sign] || [];
    const isAscendant = sign === ascSign;
    const isHighlighted = highlightHouse === house;
    
    return (
      <div
        key={sign}
        className={cn(
          'relative border border-primary-300 dark:border-primary-700 p-1.5 min-h-[70px]',
          'flex flex-col items-center justify-start gap-0.5',
          isAscendant && 'bg-primary-50 dark:bg-primary-950',
          isHighlighted && 'ring-2 ring-secondary-500'
        )}
      >
        {/* Sign indicator */}
        <div className="absolute top-0.5 left-1 text-[10px] text-muted-foreground">
          {SIGN_SYMBOLS[sign]}
        </div>
        
        {/* House number */}
        <div className="absolute top-0.5 right-1 text-[10px] font-medium text-primary-600 dark:text-primary-400">
          {house}
        </div>
        
        {/* Ascendant marker */}
        {isAscendant && (
          <div className="absolute bottom-0.5 left-1 text-[10px] font-bold text-accent-600">
            Asc
          </div>
        )}
        
        {/* Planets */}
        <div className="flex flex-wrap justify-center gap-0.5 mt-3">
          {planetsInSign.map((planet, idx) => (
            <span
              key={`${planet.name}-${idx}`}
              className={cn(
                'planet-badge text-[10px]',
                `planet-${planet.name.toLowerCase()}`
              )}
              title={`${planet.name}${planet.isRetrograde ? ' (R)' : ''}: ${(planet.longitude % 30).toFixed(2)}°`}
            >
              {getPlanetAbbr(planet.name)}
              {planet.isRetrograde && <sup>R</sup>}
              {showDegrees && (
                <span className="ml-0.5 opacity-70">
                  {Math.floor(planet.longitude % 30)}°
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('chart-container', className)}>
      <div className="chart-south-indian">
        {/* Row 0 */}
        {renderHouse(12)}
        {renderHouse(1)}
        {renderHouse(2)}
        {renderHouse(3)}
        
        {/* Row 1 */}
        {renderHouse(11)}
        <div className="house-center col-span-2 row-span-2 flex items-center justify-center">
          <div className="text-center">
            <div className="font-sanskrit text-2xl text-primary-600 dark:text-primary-400">
              राशि
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Rashi Chart
            </div>
          </div>
        </div>
        {renderHouse(4)}
        
        {/* Row 2 */}
        {renderHouse(10)}
        {renderHouse(5)}
        
        {/* Row 3 */}
        {renderHouse(9)}
        {renderHouse(8)}
        {renderHouse(7)}
        {renderHouse(6)}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
        {planets.map((planet) => (
          <div
            key={planet.name}
            className="flex items-center gap-1"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: planetColors[planet.name] }}
            />
            <span className="text-muted-foreground">
              {planet.name}
              {planet.isRetrograde && ' (R)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
