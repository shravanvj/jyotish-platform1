// ============================================
// Core Types
// ============================================

export interface User {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier: 'free' | 'premium' | 'professional';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ============================================
// Astrology Types
// ============================================

export type Planet = 
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' 
  | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

export type Rashi = 
  | 'Mesha' | 'Vrishabha' | 'Mithuna' | 'Karka' 
  | 'Simha' | 'Kanya' | 'Tula' | 'Vrishchika' 
  | 'Dhanu' | 'Makara' | 'Kumbha' | 'Meena';

export type WesternSign = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' 
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' 
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type Nakshatra = 
  | 'Ashwini' | 'Bharani' | 'Krittika' | 'Rohini' | 'Mrigashira'
  | 'Ardra' | 'Punarvasu' | 'Pushya' | 'Ashlesha' | 'Magha'
  | 'Purva Phalguni' | 'Uttara Phalguni' | 'Hasta' | 'Chitra' | 'Swati'
  | 'Vishakha' | 'Anuradha' | 'Jyeshtha' | 'Mula' | 'Purva Ashadha'
  | 'Uttara Ashadha' | 'Shravana' | 'Dhanishta' | 'Shatabhisha'
  | 'Purva Bhadrapada' | 'Uttara Bhadrapada' | 'Revati';

export interface PlanetPosition {
  planet: Planet;
  longitude: number;
  latitude: number;
  speed: number;
  rashi: Rashi;
  rashi_num: number;
  degree_in_rashi: number;
  nakshatra: Nakshatra;
  nakshatra_num: number;
  nakshatra_pada: number;
  nakshatra_lord: Planet;
  is_retrograde: boolean;
  house: number;
}

export interface HousePosition {
  house: number;
  cusp_longitude: number;
  rashi: Rashi;
  rashi_num: number;
  lord: Planet;
  planets: Planet[];
}

export interface BirthChart {
  id?: string;
  birth_datetime: string;
  latitude: number;
  longitude: number;
  timezone_offset: number;
  location_name?: string;
  ayanamsa: string;
  ayanamsa_value: number;
  planets: PlanetPosition[];
  houses: HousePosition[];
  ascendant: {
    longitude: number;
    rashi: Rashi;
    rashi_num: number;
    nakshatra: Nakshatra;
    nakshatra_pada: number;
  };
  divisional_charts?: {
    [key: string]: {
      planets: PlanetPosition[];
      houses: HousePosition[];
    };
  };
}

// ============================================
// Panchang Types
// ============================================

export interface Tithi {
  number: number;
  name: string;
  paksha: 'Shukla' | 'Krishna';
  lord: Planet;
  start_time: string;
  end_time: string;
  is_purnima: boolean;
  is_amavasya: boolean;
}

export interface NakshatraInfo {
  number: number;
  name: string;
  pada: number;
  lord: Planet;
  deity: string;
  start_time: string;
  end_time: string;
}

export interface Yoga {
  number: number;
  name: string;
  nature: 'Auspicious' | 'Inauspicious' | 'Neutral';
  start_time: string;
  end_time: string;
}

export interface Karana {
  number: number;
  name: string;
  type: 'Chara' | 'Sthira' | 'Dhriti';
  lord: string;
  start_time: string;
  end_time: string;
}

export interface Panchang {
  date: string;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  tithi: Tithi;
  nakshatra: Nakshatra;
  yoga: Yoga;
  karana: Karana;
  vara: {
    name: string;
    lord: Planet;
  };
  rahu_kalam: {
    start: string;
    end: string;
  };
  gulika_kalam: {
    start: string;
    end: string;
  };
  yamagandam: {
    start: string;
    end: string;
  };
  abhijit_muhurat?: {
    start: string;
    end: string;
  };
}

// ============================================
// Matchmaking Types
// ============================================

export interface KootaScore {
  koota: string;
  max_points: number;
  obtained_points: number;
  description: string;
  result: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

export interface DoshaAnalysis {
  dosha: string;
  present_in_male: boolean;
  present_in_female: boolean;
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  cancellation: boolean;
  remedies: string[];
}

export interface CompatibilityResult {
  male_name?: string;
  female_name?: string;
  male_nakshatra: Nakshatra;
  female_nakshatra: Nakshatra;
  male_rashi: Rashi;
  female_rashi: Rashi;
  ashtakoota: {
    total_points: number;
    max_points: number;
    percentage: number;
    scores: KootaScore[];
  };
  dashakoota?: {
    total_points: number;
    max_points: number;
    scores: KootaScore[];
  };
  doshas: DoshaAnalysis[];
  overall_compatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  recommendation: string;
}

// ============================================
// Muhurat Types
// ============================================

export type MuhuratEventType = 
  | 'marriage' | 'griha_pravesh' | 'business' | 'travel' 
  | 'surgery' | 'vehicle' | 'property' | 'engagement' 
  | 'education' | 'jewellery' | 'general';

export type MuhuratQuality = 'excellent' | 'good' | 'moderate' | 'poor';

export interface Muhurat {
  start_time: string;
  end_time: string;
  quality: MuhuratQuality;
  event_type: MuhuratEventType;
  tithi: string;
  nakshatra: string;
  yoga: string;
  favorable_factors: string[];
  unfavorable_factors: string[];
}

export interface Choghadiya {
  name: string;
  type: 'Day' | 'Night';
  quality: 'Excellent' | 'Good' | 'Moderate' | 'Bad';
  start_time: string;
  end_time: string;
  suitable_for: string[];
}

export interface Hora {
  planet: Planet;
  start_time: string;
  end_time: string;
  suitable_for: string[];
}

// ============================================
// Dasha Types
// ============================================

export interface DashaPeriod {
  planet: Planet;
  start_date: string;
  end_date: string;
  duration_years: number;
  sub_periods?: DashaPeriod[];
}

export interface VimshottariDasha {
  birth_nakshatra: Nakshatra;
  balance_at_birth: {
    planet: Planet;
    years: number;
    months: number;
    days: number;
  };
  mahadasha_sequence: DashaPeriod[];
  current_dasha: {
    mahadasha: DashaPeriod;
    antardasha: DashaPeriod;
    pratyantardasha?: DashaPeriod;
  };
}

// ============================================
// Profile Types
// ============================================

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  relationship?: string;
  birth_datetime: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  timezone_offset: number;
  moon_sign?: Rashi;
  sun_sign?: Rashi;
  ascendant_sign?: Rashi;
  moon_nakshatra?: Nakshatra;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileInput {
  name: string;
  relationship?: string;
  birth_datetime: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  timezone_offset: number;
}

// ============================================
// Report Types
// ============================================

export type ReportType = 
  | 'birth_chart' | 'compatibility' | 'dasha' 
  | 'transit' | 'yearly' | 'comprehensive';

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Report {
  id: string;
  user_id: string;
  report_type: ReportType;
  status: ReportStatus;
  profile_id: string;
  partner_profile_id?: string;
  config: {
    include_remedies: boolean;
    include_gemstones: boolean;
    include_mantras: boolean;
    language: string;
  };
  file_path?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  expires_at?: string;
}

export interface ReportTypeInfo {
  type: ReportType;
  name: string;
  description: string;
  price: number;
  page_estimate: string;
  features: string[];
  requires_premium: boolean;
}

// ============================================
// Horoscope Types
// ============================================

export interface DailyHoroscope {
  rashi: Rashi;
  date: string;
  general: string;
  love: string;
  career: string;
  health: string;
  finance: string;
  lucky_number: number;
  lucky_color: string;
  lucky_time: string;
  do_list: string[];
  avoid_list: string[];
}

export interface WeeklyHoroscope {
  rashi: Rashi;
  start_date: string;
  end_date: string;
  overview: string;
  best_days: string[];
  challenging_days: string[];
  focus_areas: string[];
}

// ============================================
// API Types
// ============================================

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  is_active: boolean;
  rate_limit_per_minute: number;
  monthly_limit: number;
  current_month_usage: number;
  last_used_at?: string;
  created_at: string;
}

export interface ApiKeyUsage {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time_ms: number;
  by_endpoint: {
    [endpoint: string]: number;
  };
  by_day: {
    [date: string]: number;
  };
}

// ============================================
// Form Input Types
// ============================================

export interface BirthDataInput {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  latitude: number;
  longitude: number;
  location_name: string;
  timezone_offset: number;
}

export interface LocationSuggestion {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  state?: string;
}

// ============================================
// Response Types
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}
