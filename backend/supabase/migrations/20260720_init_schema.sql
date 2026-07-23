-- Smooth Trans Supabase Initial Database Schema (PostgreSQL-compatible)
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
    role VARCHAR(20) NOT NULL DEFAULT 'passenger', -- passenger, driver, dispatcher, admin
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- VEHICLES TABLE
CREATE TABLE public.vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    type VARCHAR(20) NOT NULL, -- Transport, SchoolBus, DeliveryVan, MovingTruck
    status VARCHAR(20) DEFAULT 'Active', -- Active, InService, Maintenance
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
    status VARCHAR(20) DEFAULT 'Available', -- Available, Active, Offline
    rating FLOAT DEFAULT 5.0,
    vehicle_id INT REFERENCES public.vehicles(id) ON DELETE SET NULL
);

-- BOOKINGS TABLE
CREATE TABLE public.bookings (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    driver_id INT REFERENCES public.users(id) ON DELETE SET NULL,
    vehicle_id INT REFERENCES public.vehicles(id) ON DELETE SET NULL,
    booking_type VARCHAR(20) NOT NULL, -- General, School, Delivery, Moving
    pickup_address VARCHAR(200) NOT NULL,
    dropoff_address VARCHAR(200) NOT NULL,
    pickup_lat FLOAT NOT NULL,
    pickup_lng FLOAT NOT NULL,
    dropoff_lat FLOAT NOT NULL,
    dropoff_lng FLOAT NOT NULL,
    pickup_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fare FLOAT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Assigned, Active, Completed, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PAYMENTS TABLE
CREATE TABLE public.payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    amount FLOAT NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- MPesa, Card
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Completed, Failed
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
    type VARCHAR(20) NOT NULL, -- SMS, Email, Push
    status VARCHAR(20) DEFAULT 'Sent', -- Sent, Read
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
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_progress ENABLE ROW LEVEL SECURITY;

-- Note: Since the Flask backend accesses the database using the postgres direct URL, 
-- it operates as a superuser and bypasses RLS. These policies are in place to secure 
-- the database if frontend clients connect directly to Supabase REST/GraphQL APIs.

-- 1. USERS POLICIES
CREATE POLICY user_read_own ON public.users 
    FOR SELECT USING (true); -- Simplified for hybrid API usage

CREATE POLICY user_write_own ON public.users 
    FOR ALL USING (true);

-- 2. VEHICLES POLICIES
CREATE POLICY auth_view_vehicles ON public.vehicles
    FOR SELECT USING (true);

CREATE POLICY manage_vehicles ON public.vehicles
    FOR ALL USING (true);

-- 3. DRIVER PROFILES POLICIES
CREATE POLICY view_driver_profiles ON public.driver_profiles
    FOR SELECT USING (true);

CREATE POLICY manage_driver_profiles ON public.driver_profiles
    FOR ALL USING (true);

-- 4. BOOKINGS POLICIES
CREATE POLICY view_bookings ON public.bookings
    FOR SELECT USING (true);

CREATE POLICY manage_bookings ON public.bookings
    FOR ALL USING (true);

-- 5. PAYMENTS POLICIES
CREATE POLICY view_payments ON public.payments
    FOR SELECT USING (true);

CREATE POLICY manage_payments ON public.payments
    FOR ALL USING (true);

-- 6. MAINTENANCE LOGS POLICIES
CREATE POLICY view_maintenance ON public.maintenance_logs
    FOR SELECT USING (true);

CREATE POLICY manage_maintenance ON public.maintenance_logs
    FOR ALL USING (true);

-- 7. NOTIFICATIONS POLICIES
CREATE POLICY view_notifications ON public.notifications
    FOR SELECT USING (true);

CREATE POLICY manage_notifications ON public.notifications
    FOR ALL USING (true);

-- 8. TRIP PROGRESS POLICIES
CREATE POLICY view_trip_progress ON public.trip_progress
    FOR SELECT USING (true);

CREATE POLICY manage_trip_progress ON public.trip_progress
    FOR ALL USING (true);
