-- ==============================================================================
-- Supabase Schema for Vedika Tours & Travels
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. CARS FLEET TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Sedan', 'SUV', 'MPV', 'Mini Bus', etc.
    seating_capacity INTEGER NOT NULL DEFAULT 4,
    luggage_capacity INTEGER NOT NULL DEFAULT 2,
    image_url TEXT,
    price_per_km NUMERIC(10, 2) NOT NULL DEFAULT 12.00,
    base_fare NUMERIC(10, 2) NOT NULL DEFAULT 1500.00,
    min_km_per_day NUMERIC(10, 2) NOT NULL DEFAULT 250.00,
    has_ac BOOLEAN DEFAULT TRUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. PRICING SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pricing_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    night_charge_amount NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    night_start_time TEXT NOT NULL DEFAULT '22:00',
    night_end_time TEXT NOT NULL DEFAULT '06:00',
    driver_allowance_per_day NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    toll_parking_note TEXT DEFAULT 'Toll, parking, and state permits are to be paid directly as per actual receipts.',
    is_gst_enabled BOOLEAN DEFAULT FALSE,
    gst_percentage NUMERIC(5, 2) DEFAULT 5.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. BOOKINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    trip_type TEXT NOT NULL DEFAULT 'one-way', -- 'one-way' or 'round-trip'
    pickup_location TEXT NOT NULL,
    pickup_lat NUMERIC(10, 6),
    pickup_lng NUMERIC(10, 6),
    drop_location TEXT NOT NULL,
    drop_lat NUMERIC(10, 6),
    drop_lng NUMERIC(10, 6),
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    return_date DATE,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    car_name TEXT,
    total_km NUMERIC(10, 2) NOT NULL,
    billable_km NUMERIC(10, 2) NOT NULL,
    km_rate NUMERIC(10, 2) NOT NULL,
    base_fare NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    km_charge NUMERIC(10, 2) NOT NULL,
    night_charge NUMERIC(10, 2) DEFAULT 0.00,
    driver_allowance NUMERIC(10, 2) DEFAULT 0.00,
    total_estimated_price NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public can view active cars" ON public.cars;
DROP POLICY IF EXISTS "Authenticated admins can manage cars" ON public.cars;
DROP POLICY IF EXISTS "Public can view pricing settings" ON public.pricing_settings;
DROP POLICY IF EXISTS "Authenticated admins can manage pricing settings" ON public.pricing_settings;
DROP POLICY IF EXISTS "Public can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated admins can manage bookings" ON public.bookings;

-- CARS POLICIES
CREATE POLICY "Public can view active cars"
    ON public.cars FOR SELECT
    USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins can manage cars"
    ON public.cars FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- PRICING POLICIES
CREATE POLICY "Public can view pricing settings"
    ON public.pricing_settings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated admins can manage pricing settings"
    ON public.pricing_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- BOOKINGS POLICIES
CREATE POLICY "Public can view bookings"
    ON public.bookings FOR SELECT
    USING (true);

CREATE POLICY "Public can insert bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authenticated admins can manage bookings"
    ON public.bookings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. INITIAL SEED DATA
-- ------------------------------------------------------------------------------

-- Insert Initial Pricing Settings (if empty)
INSERT INTO public.pricing_settings (night_charge_amount, night_start_time, night_end_time, driver_allowance_per_day)
SELECT 300.00, '22:00', '06:00', 300.00
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_settings);

-- Insert Default Fleet Cars (if empty)
INSERT INTO public.cars (name, category, seating_capacity, luggage_capacity, image_url, price_per_km, base_fare, min_km_per_day, has_ac, description)
SELECT 'Maruti Dzire', 'Sedan', 4, 2, 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/9apj97mz_SwiftDzire.jpeg', 12.00, 1500.00, 250.00, true, 'Comfortable sedan for small families and city / outstation travel.'
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE name = 'Maruti Dzire');

INSERT INTO public.cars (name, category, seating_capacity, luggage_capacity, image_url, price_per_km, base_fare, min_km_per_day, has_ac, description)
SELECT 'Maruti Ertiga', 'MPV', 7, 3, 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/86yf1r45_Ertiga.jpeg', 15.00, 2000.00, 300.00, true, 'Spacious 7-seater MPV perfect for family vacations and temple tours.'
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE name = 'Maruti Ertiga');

INSERT INTO public.cars (name, category, seating_capacity, luggage_capacity, image_url, price_per_km, base_fare, min_km_per_day, has_ac, description)
SELECT 'Toyota Innova Crysta', 'SUV', 7, 4, 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/kn2rjj02_Innova.jpeg', 19.00, 2500.00, 300.00, true, 'Premium executive SUV offering high-end comfort and large luggage space.'
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE name = 'Toyota Innova Crysta');

INSERT INTO public.cars (name, category, seating_capacity, luggage_capacity, image_url, price_per_km, base_fare, min_km_per_day, has_ac, description)
SELECT 'Tempo Traveller', 'Mini Bus', 17, 8, 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/jgivmkig_tempo.jpeg', 26.00, 4500.00, 300.00, true, 'Ideal for large groups, wedding transfers, Ashtavinayak and Konkan tours.'
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE name = 'Tempo Traveller');

-- Update existing cars to the correct vehicle images
UPDATE public.cars SET image_url = 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/9apj97mz_SwiftDzire.jpeg' WHERE name ILIKE '%Dzire%';
UPDATE public.cars SET image_url = 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/86yf1r45_Ertiga.jpeg' WHERE name ILIKE '%Ertiga%';
UPDATE public.cars SET image_url = 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/kn2rjj02_Innova.jpeg' WHERE name ILIKE '%Innova%';
UPDATE public.cars SET image_url = 'https://customer-assets.emergentagent.com/job_panvel-travel/artifacts/jgivmkig_tempo.jpeg' WHERE name ILIKE '%Tempo%';
