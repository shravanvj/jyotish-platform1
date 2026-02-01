/**
 * Utility Functions for Jyotish Platform
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// Styling Utilities
// ============================================

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Date & Time Utilities
// ============================================

/**
 * Format date for display
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format time for display
 */
export function formatTime(
  time: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof time === 'string' ? new Date(time) : time;
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format datetime for display
 */
export function formatDateTime(
  datetime: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof datetime === 'string' ? new Date(datetime) : datetime;
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(): number {
  return -(new Date().getTimezoneOffset() / 60);
}

/**
 * Format duration in years, months, days
 */
export function formatDuration(days: number): string {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (remainingDays > 0 || parts.length === 0) parts.push(`${remainingDays}d`);

  return parts.join(' ');
}

// ============================================
// Astrology Utilities
// ============================================

/**
 * Rashi data with symbols and details
 */
export const RASHIS = [
  { num: 1, name: 'Mesha', english: 'Aries', symbol: '♈', element: 'Fire', ruler: 'Mars' },
  { num: 2, name: 'Vrishabha', english: 'Taurus', symbol: '♉', element: 'Earth', ruler: 'Venus' },
  { num: 3, name: 'Mithuna', english: 'Gemini', symbol: '♊', element: 'Air', ruler: 'Mercury' },
  { num: 4, name: 'Karka', english: 'Cancer', symbol: '♋', element: 'Water', ruler: 'Moon' },
  { num: 5, name: 'Simha', english: 'Leo', symbol: '♌', element: 'Fire', ruler: 'Sun' },
  { num: 6, name: 'Kanya', english: 'Virgo', symbol: '♍', element: 'Earth', ruler: 'Mercury' },
  { num: 7, name: 'Tula', english: 'Libra', symbol: '♎', element: 'Air', ruler: 'Venus' },
  { num: 8, name: 'Vrishchika', english: 'Scorpio', symbol: '♏', element: 'Water', ruler: 'Mars' },
  { num: 9, name: 'Dhanu', english: 'Sagittarius', symbol: '♐', element: 'Fire', ruler: 'Jupiter' },
  { num: 10, name: 'Makara', english: 'Capricorn', symbol: '♑', element: 'Earth', ruler: 'Saturn' },
  { num: 11, name: 'Kumbha', english: 'Aquarius', symbol: '♒', element: 'Air', ruler: 'Saturn' },
  { num: 12, name: 'Meena', english: 'Pisces', symbol: '♓', element: 'Water', ruler: 'Jupiter' },
] as const;

/**
 * Planet data with symbols and colors
 */
export const PLANETS = {
  Sun: { symbol: '☉', sanskrit: 'Surya', color: '#f59e0b' },
  Moon: { symbol: '☽', sanskrit: 'Chandra', color: '#94a3b8' },
  Mars: { symbol: '♂', sanskrit: 'Mangal', color: '#ef4444' },
  Mercury: { symbol: '☿', sanskrit: 'Budha', color: '#22c55e' },
  Jupiter: { symbol: '♃', sanskrit: 'Guru', color: '#eab308' },
  Venus: { symbol: '♀', sanskrit: 'Shukra', color: '#ec4899' },
  Saturn: { symbol: '♄', sanskrit: 'Shani', color: '#3b82f6' },
  Rahu: { symbol: '☊', sanskrit: 'Rahu', color: '#8b5cf6' },
  Ketu: { symbol: '☋', sanskrit: 'Ketu', color: '#f97316' },
} as const;

/**
 * Nakshatra data
 */
export const NAKSHATRAS = [
  { num: 1, name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras' },
  { num: 2, name: 'Bharani', lord: 'Venus', deity: 'Yama' },
  { num: 3, name: 'Krittika', lord: 'Sun', deity: 'Agni' },
  { num: 4, name: 'Rohini', lord: 'Moon', deity: 'Brahma' },
  { num: 5, name: 'Mrigashira', lord: 'Mars', deity: 'Soma' },
  { num: 6, name: 'Ardra', lord: 'Rahu', deity: 'Rudra' },
  { num: 7, name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi' },
  { num: 8, name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati' },
  { num: 9, name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas' },
  { num: 10, name: 'Magha', lord: 'Ketu', deity: 'Pitris' },
  { num: 11, name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga' },
  { num: 12, name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman' },
  { num: 13, name: 'Hasta', lord: 'Moon', deity: 'Savitar' },
  { num: 14, name: 'Chitra', lord: 'Mars', deity: 'Vishwakarma' },
  { num: 15, name: 'Swati', lord: 'Rahu', deity: 'Vayu' },
  { num: 16, name: 'Vishakha', lord: 'Jupiter', deity: 'Indra-Agni' },
  { num: 17, name: 'Anuradha', lord: 'Saturn', deity: 'Mitra' },
  { num: 18, name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra' },
  { num: 19, name: 'Mula', lord: 'Ketu', deity: 'Nirriti' },
  { num: 20, name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas' },
  { num: 21, name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishwadevas' },
  { num: 22, name: 'Shravana', lord: 'Moon', deity: 'Vishnu' },
  { num: 23, name: 'Dhanishta', lord: 'Mars', deity: 'Vasus' },
  { num: 24, name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna' },
  { num: 25, name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Ajaikapada' },
  { num: 26, name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahirbudhnya' },
  { num: 27, name: 'Revati', lord: 'Mercury', deity: 'Pushan' },
] as const;

/**
 * Get rashi by number or name
 */
export function getRashi(identifier: number | string) {
  if (typeof identifier === 'number') {
    return RASHIS.find((r) => r.num === identifier);
  }
  const lower = identifier.toLowerCase();
  return RASHIS.find(
    (r) =>
      r.name.toLowerCase() === lower ||
      r.english.toLowerCase() === lower
  );
}

/**
 * Get planet data
 */
export function getPlanet(name: string) {
  return PLANETS[name as keyof typeof PLANETS];
}

/**
 * Get zodiac sign from degree (0-360)
 */
export function getZodiacSign(degree: number): string {
  const signIndex = Math.floor((degree % 360) / 30);
  return RASHIS[signIndex]?.name || 'Unknown';
}

/**
 * Planet colors for chart display
 */
export const planetColors: Record<string, string> = {
  Sun: '#f59e0b',
  Moon: '#94a3b8',
  Mars: '#ef4444',
  Mercury: '#22c55e',
  Jupiter: '#eab308',
  Venus: '#ec4899',
  Saturn: '#3b82f6',
  Rahu: '#8b5cf6',
  Ketu: '#f97316',
};

/**
 * Get planet abbreviation for chart display
 */
export function getPlanetAbbr(planet: string): string {
  const abbrs: Record<string, string> = {
    Sun: 'Su',
    Moon: 'Mo',
    Mars: 'Ma',
    Mercury: 'Me',
    Jupiter: 'Ju',
    Venus: 'Ve',
    Saturn: 'Sa',
    Rahu: 'Ra',
    Ketu: 'Ke',
  };
  return abbrs[planet] || planet.slice(0, 2);
}

/**
 * Get nakshatra by number or name
 */
export function getNakshatra(identifier: number | string) {
  if (typeof identifier === 'number') {
    return NAKSHATRAS.find((n) => n.num === identifier);
  }
  return NAKSHATRAS.find(
    (n) => n.name.toLowerCase() === identifier.toLowerCase()
  );
}

/**
 * Format degrees as DMS (degrees, minutes, seconds)
 */
export function formatDegrees(degrees: number, includeRashi = false): string {
  const sign = degrees < 0 ? -1 : 1;
  const absDeg = Math.abs(degrees);

  if (includeRashi) {
    const rashiNum = Math.floor(absDeg / 30) + 1;
    const degInRashi = absDeg % 30;
    const rashi = RASHIS[rashiNum - 1];
    const d = Math.floor(degInRashi);
    const m = Math.floor((degInRashi - d) * 60);
    const s = Math.round(((degInRashi - d) * 60 - m) * 60);
    return `${d}° ${m}' ${s}" ${rashi?.name || ''}`;
  }

  const d = Math.floor(absDeg);
  const m = Math.floor((absDeg - d) * 60);
  const s = Math.round(((absDeg - d) * 60 - m) * 60);
  return `${sign < 0 ? '-' : ''}${d}° ${m}' ${s}"`;
}

/**
 * Format longitude for display
 */
export function formatLongitude(degrees: number): string {
  const d = Math.floor(degrees);
  const m = Math.floor((degrees - d) * 60);
  return `${d}° ${m}'`;
}

// ============================================
// Number Utilities
// ============================================

/**
 * Format number with commas
 */
export function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency = 'INR'
): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================
// String Utilities
// ============================================

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert to title case
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// Validation Utilities
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Validate date string (YYYY-MM-DD)
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validate time string (HH:MM)
 */
export function isValidTime(timeStr: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
}

// ============================================
// Misc Utilities
// ============================================

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if running on server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
