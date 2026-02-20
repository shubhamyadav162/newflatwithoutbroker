-- FlatWithoutBrokerage.com Database Schema for Supabase
-- Migrated from Prisma schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (ENUMs)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('BUYER', 'OWNER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('APARTMENT', 'VILLA', 'PG', 'SHOP', 'OFFICE', 'PLOT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_type AS ENUM ('RENT', 'SELL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_status AS ENUM ('ACTIVE', 'SOLD', 'RENTED', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE furnishing AS ENUM ('FULLY', 'SEMI', 'NONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tenant_type AS ENUM ('FAMILY', 'BACHELOR', 'COMPANY', 'ANY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE availability AS ENUM ('IMMEDIATE', 'WITHIN15', 'WITHIN30');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    name TEXT,
    avatar TEXT,
    google_id TEXT UNIQUE,
    role user_role DEFAULT 'BUYER',
    is_verified BOOLEAN DEFAULT FALSE,
    credits INTEGER DEFAULT 9999,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type property_type NOT NULL,
    listing_type listing_type NOT NULL,
    status property_status DEFAULT 'ACTIVE',
    
    -- Pricing
    price DOUBLE PRECISION NOT NULL,
    deposit DOUBLE PRECISION,
    maintenance DOUBLE PRECISION,
    
    -- Details
    bhk INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 1,
    built_up_area INTEGER NOT NULL,
    furnishing furnishing DEFAULT 'NONE',
    tenant_type tenant_type DEFAULT 'ANY',
    availability availability DEFAULT 'IMMEDIATE',
    
    -- Location
    locality TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT DEFAULT 'Maharashtra',
    pincode TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    -- Media
    images TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    contact_phone TEXT,
    
    -- Stats
    views INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Relations
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Contact Access Table
CREATE TABLE IF NOT EXISTS contact_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Relations
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_locality ON properties(locality);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);

CREATE INDEX IF NOT EXISTS idx_contact_access_viewer ON contact_access(viewer_id);
CREATE INDEX IF NOT EXISTS idx_contact_access_property ON contact_access(property_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR role = 'ADMIN');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Service role can manage all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for properties table
CREATE POLICY "Anyone can view active properties" ON properties
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Owners can manage their properties" ON properties
    FOR ALL USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Admins can manage all properties" ON properties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Service role can manage all properties" ON properties
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for contact_access table
CREATE POLICY "Users can view their contact accesses" ON contact_access
    FOR SELECT USING (
        auth.uid()::text = viewer_id::text 
        OR auth.uid()::text = owner_id::text
    );

CREATE POLICY "Users can create contact access" ON contact_access
    FOR INSERT WITH CHECK (auth.uid()::text = viewer_id::text);

CREATE POLICY "Service role can manage all contact access" ON contact_access
    FOR ALL USING (auth.role() = 'service_role');

-- Allow public read access for properties (unauthenticated users)
CREATE POLICY "Public can view active properties" ON properties
    FOR SELECT USING (status = 'ACTIVE');
