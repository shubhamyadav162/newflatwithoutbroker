-- ============================================
-- FlatWithoutBrokerage - FIX RLS + SEED DATA
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================

-- ==========================================
-- STEP 1: FIX RLS POLICIES
-- ==========================================

-- Drop all existing policies first (clean slate)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
DROP POLICY IF EXISTS "Anyone can view active properties" ON properties;
DROP POLICY IF EXISTS "Owners can manage their properties" ON properties;
DROP POLICY IF EXISTS "Admins can manage all properties" ON properties;
DROP POLICY IF EXISTS "Service role can manage all properties" ON properties;
DROP POLICY IF EXISTS "Users can view their contact accesses" ON contact_access;
DROP POLICY IF EXISTS "Users can create contact access" ON contact_access;
DROP POLICY IF EXISTS "Service role can manage all contact access" ON contact_access;
DROP POLICY IF EXISTS "Public can view active properties" ON properties;

-- Drop the newly generated policies to ensure pure idempotency
DROP POLICY IF EXISTS "Authenticated users can view users securely" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public can view all properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON properties;
DROP POLICY IF EXISTS "Owners can update own properties" ON properties;
DROP POLICY IF EXISTS "Owners can delete own properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can view contacts securely" ON contact_access;
DROP POLICY IF EXISTS "Users can create contact access" ON contact_access;

-- ==========================================
-- SECURE ROLE CHECK FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check if auth.uid() is an ADMIN or OWNER
  SELECT role INTO v_role FROM users WHERE id::text = auth.uid()::text LIMIT 1;
  RETURN v_role IN ('ADMIN', 'OWNER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PRIVILEGE ESCALATION PREVENTION
-- ==========================================
CREATE OR REPLACE FUNCTION prevent_role_escalation() RETURNS TRIGGER AS $$
BEGIN
  -- Prevent authenticated users from modifying sensitive fields
  -- The service_role (backend) bypasses RLS and triggers can check auth.uid()
  IF (auth.uid() IS NOT NULL) THEN
     IF (NEW.role IS DISTINCT FROM OLD.role) THEN
        NEW.role = OLD.role;
     END IF;
     IF (NEW.credits IS DISTINCT FROM OLD.credits) THEN
        NEW.credits = OLD.credits;
     END IF;
     IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified) THEN
        NEW.is_verified = OLD.is_verified;
     END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_role_escalation ON users;
CREATE TRIGGER tr_prevent_role_escalation
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION prevent_role_escalation();

-- ---- USERS TABLE POLICIES ----
-- Allow authenticated users to read their own profile OR admins to read all
CREATE POLICY "Authenticated users can view users securely" ON users
    FOR SELECT TO authenticated USING (
        auth.uid()::text = id::text OR is_admin()
    );

-- Allow anyone to INSERT their own profile (needed for login/signup)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = id::text);

-- Allow users to update their own profile (Trigger prevents role/credit escalation)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE TO authenticated USING (auth.uid()::text = id::text);

-- ---- PROPERTIES TABLE POLICIES ----
-- Anyone (even not logged in) can VIEW all properties
CREATE POLICY "Public can view all properties" ON properties
    FOR SELECT USING (true);

-- Authenticated users can INSERT properties
CREATE POLICY "Authenticated users can insert properties" ON properties
    FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id::text);

-- Owners can UPDATE their own properties
CREATE POLICY "Owners can update own properties" ON properties
    FOR UPDATE TO authenticated USING (auth.uid()::text = owner_id::text);

-- Owners can DELETE their own properties
CREATE POLICY "Owners can delete own properties" ON properties
    FOR DELETE TO authenticated USING (auth.uid()::text = owner_id::text);

-- ---- CONTACT ACCESS TABLE POLICIES ----
-- Allow authenticated users to view their own contact access, OR admins to view all
CREATE POLICY "Authenticated users can view contacts securely" ON contact_access
    FOR SELECT TO authenticated USING (
        auth.uid()::text = viewer_id::text OR is_admin()
    );

-- Users can create contact access entries
CREATE POLICY "Users can create contact access" ON contact_access
    FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = viewer_id::text);


-- ==========================================
-- STEP 2: SEED DEMO PROPERTIES
-- ==========================================

-- First, create a system owner for demo properties
INSERT INTO users (id, email, name, role, is_verified, credits, avatar)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@flatwithoutbrokerage.com',
    'FlatWithoutBrokerage Demo',
    'OWNER',
    true,
    9999,
    null
) ON CONFLICT (id) DO NOTHING;

-- Insert Demo Properties
INSERT INTO properties (title, description, type, listing_type, status, price, deposit, maintenance, bhk, bathrooms, built_up_area, furnishing, tenant_type, availability, locality, city, state, pincode, images, amenities, contact_phone, views, owner_id) VALUES

-- Mumbai Properties
('Spacious 2BHK in Andheri West', 'Beautiful 2BHK apartment with modern amenities, close to metro station and shopping centers. Well-ventilated with natural light.', 'APARTMENT', 'RENT', 'ACTIVE', 35000, 100000, 3500, 2, 2, 950, 'SEMI', 'FAMILY', 'IMMEDIATE', 'Andheri West', 'Mumbai', 'Maharashtra', '400058', '{}', '{"Parking", "Lift", "Security", "Power Backup", "Water Supply", "Garden"}', '9876543210', 245, '00000000-0000-0000-0000-000000000001'),

('Luxury 3BHK Sea View Bandra', 'Premium 3BHK apartment with stunning sea view in Bandra West. Italian marble flooring, modular kitchen, imported fittings.', 'APARTMENT', 'SELL', 'ACTIVE', 45000000, null, null, 3, 3, 1850, 'FULLY', 'ANY', 'WITHIN15', 'Bandra West', 'Mumbai', 'Maharashtra', '400050', '{}', '{"Swimming Pool", "Gym", "Clubhouse", "Parking", "Lift", "Security", "Power Backup", "CCTV"}', '9876543211', 532, '00000000-0000-0000-0000-000000000001'),

('1BHK Budget Friendly Thane', 'Affordable 1BHK in Thane with good connectivity. Near railway station and bus stop. Ideal for bachelors or small families.', 'APARTMENT', 'RENT', 'ACTIVE', 12000, 30000, 1500, 1, 1, 450, 'NONE', 'ANY', 'IMMEDIATE', 'Ghodbunder Road', 'Thane', 'Maharashtra', '400607', '{}', '{"Lift", "Security", "Water Supply", "Power Backup"}', '9876543212', 189, '00000000-0000-0000-0000-000000000001'),

-- Delhi Properties
('Modern 3BHK in Dwarka', 'Newly renovated 3BHK apartment in Dwarka Sector 12. Walking distance to metro. Top floor with terrace rights.', 'APARTMENT', 'RENT', 'ACTIVE', 28000, 84000, 2500, 3, 2, 1200, 'SEMI', 'FAMILY', 'IMMEDIATE', 'Dwarka Sector 12', 'Delhi', 'Delhi', '110075', '{}', '{"Parking", "Lift", "Security", "Power Backup", "Water Supply", "RO Water"}', '9876543213', 312, '00000000-0000-0000-0000-000000000001'),

('Premium Villa in Vasant Kunj', 'Independent luxury villa with 4 bedrooms, private garden, and rooftop terrace. Gated community with 24x7 security.', 'VILLA', 'SELL', 'ACTIVE', 85000000, null, null, 4, 4, 3200, 'FULLY', 'FAMILY', 'WITHIN30', 'Vasant Kunj', 'Delhi', 'Delhi', '110070', '{}', '{"Private Garden", "Parking", "Security", "Power Backup", "Servant Quarter", "Rooftop Terrace"}', '9876543214', 178, '00000000-0000-0000-0000-000000000001'),

-- Bangalore Properties
('2BHK Near IT Hub Whitefield', 'Developer flat near ITPL and Whitefield metro. Excellent connectivity. Gated community with all amenities.', 'APARTMENT', 'RENT', 'ACTIVE', 22000, 66000, 3000, 2, 2, 1100, 'SEMI', 'ANY', 'IMMEDIATE', 'Whitefield', 'Bangalore', 'Karnataka', '560066', '{}', '{"Swimming Pool", "Gym", "Clubhouse", "Parking", "Lift", "Security", "Jogging Track"}', '9876543215', 421, '00000000-0000-0000-0000-000000000001'),

('PG for Working Professionals Koramangala', 'Fully furnished PG accommodation in Koramangala. Meals included. Walking distance to restaurants and malls.', 'PG', 'RENT', 'ACTIVE', 8500, 8500, 0, 1, 1, 200, 'FULLY', 'BACHELOR', 'IMMEDIATE', 'Koramangala', 'Bangalore', 'Karnataka', '560034', '{}', '{"WiFi", "Meals", "Laundry", "Housekeeping", "CCTV", "Power Backup"}', '9876543216', 567, '00000000-0000-0000-0000-000000000001'),

-- Pune Properties
('3BHK Penthouse Hinjewadi', 'Stunning penthouse with panoramic views in Hinjewadi IT Park area. Double height living room. Smart home enabled.', 'APARTMENT', 'SELL', 'ACTIVE', 12500000, null, null, 3, 3, 2200, 'FULLY', 'ANY', 'WITHIN15', 'Hinjewadi Phase 1', 'Pune', 'Maharashtra', '411057', '{}', '{"Swimming Pool", "Gym", "Clubhouse", "Parking", "Smart Home", "Terrace Garden"}', '9876543217', 298, '00000000-0000-0000-0000-000000000001'),

('Office Space Magarpatta', 'Prime commercial office space in Magarpatta City. Fully furnished with 20 workstations. Conference room and pantry.', 'OFFICE', 'RENT', 'ACTIVE', 55000, 165000, 5000, 0, 2, 1500, 'FULLY', 'COMPANY', 'IMMEDIATE', 'Magarpatta City', 'Pune', 'Maharashtra', '411028', '{}', '{"AC", "Parking", "Lift", "Security", "Power Backup", "WiFi", "Conference Room"}', '9876543218', 145, '00000000-0000-0000-0000-000000000001'),

-- Hyderabad Properties
('2BHK Gachibowli Tech Hub', 'Modern apartment near Microsoft and Amazon offices. Gated community with world-class amenities.', 'APARTMENT', 'RENT', 'ACTIVE', 20000, 60000, 2500, 2, 2, 1050, 'SEMI', 'ANY', 'IMMEDIATE', 'Gachibowli', 'Hyderabad', 'Telangana', '500032', '{}', '{"Swimming Pool", "Gym", "Parking", "Lift", "Clubhouse", "Jogging Track", "Children Play Area"}', '9876543219', 356, '00000000-0000-0000-0000-000000000001'),

('Commercial Shop Banjara Hills', 'Prime retail shop space in Banjara Hills Road No. 2. High footfall area. Suitable for showroom or restaurant.', 'SHOP', 'RENT', 'ACTIVE', 75000, 300000, 8000, 0, 1, 800, 'NONE', 'COMPANY', 'IMMEDIATE', 'Banjara Hills', 'Hyderabad', 'Telangana', '500034', '{}', '{"Parking", "Power Backup", "Water Supply", "Security"}', '9876543220', 89, '00000000-0000-0000-0000-000000000001'),

-- Chennai Properties  
('Villa Plot in ECR', 'Premium residential plot on East Coast Road. Clear title, DTCP approved. Perfect for building your dream home.', 'PLOT', 'SELL', 'ACTIVE', 6500000, null, null, 0, 0, 2400, 'NONE', 'ANY', 'IMMEDIATE', 'ECR', 'Chennai', 'Tamil Nadu', '600119', '{}', '{"DTCP Approved", "Clear Title", "Road Access", "Water Supply", "Electricity"}', '9876543221', 134, '00000000-0000-0000-0000-000000000001');

-- ==========================================
-- DONE! Verify the data
-- ==========================================
SELECT 'Users:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Properties:', COUNT(*) FROM properties
UNION ALL  
SELECT 'Contact Access:', COUNT(*) FROM contact_access;
