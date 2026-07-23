-- Smooth Trans Supabase Database Schema (PostgreSQL)
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/ezjecxlodpuviqqgcjwx/sql/new)

-- =========================================================================
-- 1. DROP TABLES (for clean reset if needed)
-- =========================================================================
DROP TABLE IF EXISTS public.trip_progress CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.maintenance_logs CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.driver_profiles CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =========================================================================
-- 2. CREATE TABLES
-- =========================================================================

-- USERS TABLE
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'passenger',
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(100),
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    verification_code VARCHAR(10),
    verification_code_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- VEHICLES TABLE
CREATE TABLE public.vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    mileage FLOAT DEFAULT 0.0,
    fuel_level FLOAT DEFAULT 100.0,
    avg_fuel_consumption FLOAT DEFAULT 10.0,
    last_service_mileage FLOAT DEFAULT 0.0
);

-- DRIVER PROFILES TABLE
CREATE TABLE public.driver_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_expiry DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Available',
    rating FLOAT DEFAULT 5.0,
    vehicle_id INT REFERENCES public.vehicles(id) ON DELETE SET NULL
);

-- BOOKINGS TABLE
CREATE TABLE public.bookings (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    driver_id INT REFERENCES public.users(id) ON DELETE SET NULL,
    vehicle_id INT REFERENCES public.vehicles(id) ON DELETE SET NULL,
    booking_type VARCHAR(20) NOT NULL,
    pickup_address VARCHAR(200) NOT NULL,
    dropoff_address VARCHAR(200) NOT NULL,
    pickup_lat FLOAT NOT NULL,
    pickup_lng FLOAT NOT NULL,
    dropoff_lat FLOAT NOT NULL,
    dropoff_lng FLOAT NOT NULL,
    pickup_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fare FLOAT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PAYMENTS TABLE
CREATE TABLE public.payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    amount FLOAT NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    transaction_id VARCHAR(50) UNIQUE,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    checkout_request_id VARCHAR(100),
    merchant_request_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MAINTENANCE LOGS TABLE
CREATE TABLE public.maintenance_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    description VARCHAR(250) NOT NULL,
    cost FLOAT NOT NULL,
    service_date DATE DEFAULT CURRENT_DATE,
    current_mileage FLOAT DEFAULT 0.0
);

-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    message VARCHAR(250) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRIP PROGRESS TABLE
CREATE TABLE public.trip_progress (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    speed FLOAT DEFAULT 0.0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 3. INDEXES
-- =========================================================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_reset_token ON public.users(reset_token);
CREATE INDEX idx_users_verification_code ON public.users(verification_code);
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_driver ON public.bookings(driver_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_trip_progress_booking ON public.trip_progress(booking_id);

-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_progress ENABLE ROW LEVEL SECURITY;

-- Flask backend uses direct postgres URL (superuser), bypasses RLS.
-- These policies secure direct Supabase REST/GraphQL access.

CREATE POLICY user_read_own ON public.users FOR SELECT USING (true);
CREATE POLICY user_write_own ON public.users FOR ALL USING (true);
CREATE POLICY auth_view_vehicles ON public.vehicles FOR SELECT USING (true);
CREATE POLICY manage_vehicles ON public.vehicles FOR ALL USING (true);
CREATE POLICY view_driver_profiles ON public.driver_profiles FOR SELECT USING (true);
CREATE POLICY manage_driver_profiles ON public.driver_profiles FOR ALL USING (true);
CREATE POLICY view_bookings ON public.bookings FOR SELECT USING (true);
CREATE POLICY manage_bookings ON public.bookings FOR ALL USING (true);
CREATE POLICY view_payments ON public.payments FOR SELECT USING (true);
CREATE POLICY manage_payments ON public.payments FOR ALL USING (true);
CREATE POLICY view_maintenance ON public.maintenance_logs FOR SELECT USING (true);
CREATE POLICY manage_maintenance ON public.maintenance_logs FOR ALL USING (true);
CREATE POLICY view_notifications ON public.notifications FOR SELECT USING (true);
CREATE POLICY manage_notifications ON public.notifications FOR ALL USING (true);
CREATE POLICY view_trip_progress ON public.trip_progress FOR SELECT USING (true);
CREATE POLICY manage_trip_progress ON public.trip_progress FOR ALL USING (true);
