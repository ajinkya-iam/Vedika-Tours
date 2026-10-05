import { createClient } from '@supabase/supabase-js';
import { mockData } from '../mock';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Check if credentials are provided and not dummy placeholders
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const VEHICLE_IMAGES = {
  dzire: 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/9apj97mz_SwiftDzire.jpeg',
  ertiga: 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/86yf1r45_Ertiga.jpeg',
  innova: 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/kn2rjj02_Innova.jpeg',
  tempo: 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/jgivmkig_tempo.jpeg'
};

// Image resolver helper for car fleet: fixes the expired Dzire link and defaults safely
export const getCarImageUrl = (imageUrl, carName = '') => {
  if (!imageUrl || imageUrl.includes('b034w4s2_Dzire') || imageUrl.includes('placeholder')) {
    const name = (carName || '').toLowerCase();
    if (name.includes('ertiga')) return VEHICLE_IMAGES.ertiga;
    if (name.includes('innova')) return VEHICLE_IMAGES.innova;
    if (name.includes('tempo')) return VEHICLE_IMAGES.tempo;
    return VEHICLE_IMAGES.dzire;
  }
  return imageUrl;
};

// Default fallback cars from existing fleet with pricing defaults
export const DEFAULT_CARS = [
  {
    id: 'c1-maruti-dzire',
    name: 'Maruti Dzire',
    category: 'Sedan',
    seating_capacity: 4,
    luggage_capacity: 2,
    image_url: 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/9apj97mz_SwiftDzire.jpeg',
    price_per_km: 12,
    base_fare: 1500,
    min_km_per_day: 250,
    has_ac: true,
    description: 'Comfortable sedan for small families and city / outstation travel.',
    is_active: true
  },
  {
    id: 'c2-maruti-ertiga',
    name: 'Maruti Ertiga',
    category: 'MPV',
    seating_capacity: 7,
    luggage_capacity: 3,
    image_url: 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/86yf1r45_Ertiga.jpeg',
    price_per_km: 15,
    base_fare: 2000,
    min_km_per_day: 300,
    has_ac: true,
    description: 'Spacious 7-seater MPV perfect for family vacations and temple tours.',
    is_active: true
  },
  {
    id: 'c3-innova-crysta',
    name: 'Toyota Innova Crysta',
    category: 'SUV',
    seating_capacity: 7,
    luggage_capacity: 4,
    image_url: 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/kn2rjj02_Innova.jpeg',
    price_per_km: 19,
    base_fare: 2500,
    min_km_per_day: 300,
    has_ac: true,
    description: 'Premium executive SUV offering high-end comfort and large luggage space.',
    is_active: true
  },
  {
    id: 'c4-tempo-traveller',
    name: 'Tempo Traveller',
    category: 'Mini Bus',
    seating_capacity: 17,
    luggage_capacity: 8,
    image_url: 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/jgivmkig_tempo.jpeg',
    price_per_km: 26,
    base_fare: 4500,
    min_km_per_day: 300,
    has_ac: true,
    description: 'Ideal for large groups, wedding transfers, Ashtavinayak and Konkan tours.',
    is_active: true
  }
];

export const DEFAULT_PRICING = {
  night_charge_amount: 300,
  night_start_time: '22:00',
  night_end_time: '06:00',
  driver_allowance_per_day: 300,
  toll_parking_note: 'Toll, parking, and state taxes are payable directly as per actual toll booth receipts.'
};
