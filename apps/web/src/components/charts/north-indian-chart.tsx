'use client';

import { cn, getPlanetAbbr, planetColors } from '@/lib/utils';

interface Planet {
  name: string;
  longitude: number;
  house: number;
  isRetrograde?: boolean;
}

interface NorthIndianChartProps {
  planets: Planet[];
  ascendant: number;
  className?: string;
  showDegrees?: boolean;
  highlightHouse?: number;
}

// North Indian chart is a diamond layout
// Houses start from ascendant and go counter-clockwise
// The chart has a fixed visual layout with houses mapped relative to ascendant

export function NorthIndianChart({
  planets,
  ascendant,
  className,
  showDegrees = false,
  highlightHouse,
}: NorthIndianChartProps) {
  // Calculate ascendant sign (1-12)
  const ascSign = Math.floor(ascendant / 30) + 1;
  
  // Group planets by house
  const planetsByHouse: Record<number, Planet[]> = {};
  planets.forEach((planet) => {
    const sign = Math.floor(planet.longitude / 30) + 1;
    let house = sign - ascSign + 1;
    if (house <= 0) house += 12;
    if (!planetsByHouse[house]) {
      planetsByHouse[house] = [];
    }
    planetsByHouse[house].push(planet);
  });

  // Get sign number for a house
  const getSignForHouse = (house: number): number => {
    let sign = ascSign + house - 1;
    if (sign > 12) sign -= 12;
    return sign;
  };

  const SIGN_SYMBOLS = ['', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

  // House positions in SVG coordinates (viewBox 0 0 300 300)
  // North Indian chart is a diamond with triangular houses
  const housePolygons: Record<number, { points: string; labelX: number; labelY: number }> = {
    1: { points: '150,150 150,0 75,75', labelX: 115, labelY: 60 },      // Top-left of center
    2: { points: '150,0 75,75 0,0', labelX: 50, labelY: 25 },           // Top-left corner
    3: { points: '0,0 75,75 0,75', labelX: 20, labelY: 55 },            // Left top
    4: { points: '0,75 75,75 75,150 0,150', labelX: 25, labelY: 115 },  // Left
    5: { points: '0,150 75,150 0,225', labelX: 20, labelY: 180 },       // Left bottom
    6: { points: '0,225 75,150 75,225 0,300', labelX: 25, labelY: 255 },// Bottom-left corner
    7: { points: '75,225 75,150 150,150 150,300', labelX: 115, labelY: 240 }, // Bottom-left of center
    8: { points: '150,300 150,150 225,225', labelX: 175, labelY: 240 }, // Bottom-right of center
    9: { points: '150,300 225,225 300,300', labelX: 230, labelY: 280 }, // Bottom-right corner
    10: { points: '225,225 225,150 300,225 300,300', labelX: 255, labelY: 255 }, // Right bottom
    11: { points: '300,150 225,150 300,225', labelX: 265, labelY: 180 },// Right top
    12: { points: '300,0 225,75 225,150 300,150', labelX: 255, labelY: 115 }, // Right
  };

  // Alternative simpler layout using rectangles (more common representation)
  const houseRects: Record<number, { x: number; y: number; w: number; h: number }> = {
    12: { x: 0, y: 0, w: 100, h: 100 },
    1: { x: 100, y: 0, w: 100, h: 100 },
    2: { x: 200, y: 0, w: 100, h: 100 },
    11: { x: 0, y: 100, w: 100, h: 100 },
    3: { x: 200, y: 100, w: 100, h: 100 },
    10: { x: 0, y: 200, w: 100, h: 100 },
    4: { x: 200, y: 200, w: 100, h: 100 },
    9: { x: 0, y: 300, w: 100, h: 100 },
    8: { x: 100, y: 300, w: 100, h: 100 },
    5: { x: 200, y: 300, w: 100, h: 100 },
    7: { x: 100, y: 200, w: 100, h: 100 },
    6: { x: 100, y: 100, w: 100, h: 100 },
  };

  return (
    <div className={cn('chart-container', className)}>
      <svg
        viewBox="0 0 300 400"
        className="w-full h-auto max-w-md mx-auto"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* Background */}
        <rect x="0" y="0" width="300" height="400" fill="currentColor" className="text-surface dark:text-surface-dark" />
        
        {/* Outer border */}
        <rect x="0" y="0" width="300" height="400" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-600" />
        
        {/* House grid - 3x4 layout with center open */}
        {/* Top row */}
        <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300" />
        <rect x="100" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300" />
        <rect x="200" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300" />
        
        {/* Second row */}
        <rect x="0" y="100" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300" />
        <rect x="200" y="100" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300" />
        
        {/* Third row */}
        <rect x="0" y="200" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300" />
        <rect x="200" y="200" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300" />
        
        {/* Bottom row */}
        <rect x="0" y="300" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300" />
        <rect x="100" y="300" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300" />
        <rect x="200" y="300" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300" />
        
        {/* Center box outline */}
        <rect x="100" y="100" width="100" height="200" fill="currentColor" className="text-primary-50 dark:text-primary-950" stroke="currentColor" strokeWidth="1" className="text-primary-400" />
        
        {/* Center label */}
        <text x="150" y="190" textAnchor="middle" className="text-primary-600 dark:text-primary-400 text-xs" fill="currentColor">
          Lagna
        </text>
        <text x="150" y="210" textAnchor="middle" className="text-primary-600 dark:text-primary-400 text-lg" fill="currentColor">
          {SIGN_SYMBOLS[ascSign]}
        </text>
        
        {/* House mapping for North Indian style */}
        {/* Layout: 12-1-2 / 11-C-3 / 10-C-4 / 9-8-5 with center 7-6 */}
        {Object.entries({
          12: { x: 50, y: 50 },
          1: { x: 150, y: 50 },
          2: { x: 250, y: 50 },
          11: { x: 50, y: 150 },
          3: { x: 250, y: 150 },
          10: { x: 50, y: 250 },
          4: { x: 250, y: 250 },
          9: { x: 50, y: 350 },
          8: { x: 150, y: 350 },
          5: { x: 250, y: 350 },
          7: { x: 150, y: 250 },
          6: { x: 150, y: 150 },
        }).map(([house, pos]) => {
          const houseNum = parseInt(house);
          const sign = getSignForHouse(houseNum);
          const planetsInHouse = planetsByHouse[houseNum] || [];
          const isAsc = houseNum === 1;
          const isHighlighted = highlightHouse === houseNum;
          
          // Skip center positions for 6 and 7 as they're inside the center box
          const isCenterHouse = houseNum === 6 || houseNum === 7;
          
          return (
            <g key={house}>
              {/* Highlight background */}
              {isHighlighted && !isCenterHouse && (
                <rect
                  x={pos.x - 45}
                  y={pos.y - 45}
                  width="90"
                  height="90"
                  fill="currentColor"
                  className="text-secondary-100 dark:text-secondary-900"
                  opacity="0.5"
                />
              )}
              
              {/* House number */}
              <text
                x={pos.x - 40}
                y={pos.y - 30}
                className="text-primary-500 text-[10px]"
                fill="currentColor"
              >
                {houseNum}
              </text>
              
              {/* Sign symbol */}
              <text
                x={pos.x + 35}
                y={pos.y - 30}
                textAnchor="end"
                className="text-muted-foreground text-[10px]"
                fill="currentColor"
              >
                {SIGN_SYMBOLS[sign]}
              </text>
              
              {/* Ascendant marker */}
              {isAsc && (
                <text
                  x={pos.x}
                  y={pos.y - 15}
                  textAnchor="middle"
                  className="text-accent-600 text-[8px] font-bold"
                  fill="currentColor"
                >
                  ASC
                </text>
              )}
              
              {/* Planets */}
              {planetsInHouse.map((planet, idx) => (
                <g key={`${planet.name}-${idx}`}>
                  <text
                    x={pos.x - 30 + (idx % 3) * 30}
                    y={pos.y + 5 + Math.floor(idx / 3) * 18}
                    textAnchor="middle"
                    className="text-[10px]"
                    fill={planetColors[planet.name]}
                  >
                    {getPlanetAbbr(planet.name)}
                    {planet.isRetrograde && (
                      <tspan fontSize="7" dy="-3">R</tspan>
                    )}
                  </text>
                  {showDegrees && (
                    <text
                      x={pos.x - 30 + (idx % 3) * 30}
                      y={pos.y + 15 + Math.floor(idx / 3) * 18}
                      textAnchor="middle"
                      className="text-[7px] text-muted-foreground"
                      fill="currentColor"
                    >
                      {Math.floor(planet.longitude % 30)}°
                    </text>
                  )}
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
        {planets.map((planet) => (
          <div key={planet.name} className="flex items-center gap-1">
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
