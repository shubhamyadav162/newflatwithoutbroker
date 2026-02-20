// Supabase Client Configuration for FlatWithoutBrokerage.com
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aacxwlbetyodwiohlpmr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhY3h3bGJldHlvZHdpb2hscG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjUxOTYsImV4cCI6MjA4NjIwMTE5Nn0.d8il8guNV0F2Wd7bez-bb75jyMSfGTTImjzn1_0vm38';

// Database Types (matching our Supabase schema)
export type UserRole = 'BUYER' | 'OWNER' | 'ADMIN';
export type PropertyType = 'APARTMENT' | 'VILLA' | 'PG' | 'SHOP' | 'OFFICE' | 'PLOT';
export type ListingType = 'RENT' | 'SELL';
export type PropertyStatus = 'ACTIVE' | 'SOLD' | 'RENTED' | 'INACTIVE';
export type Furnishing = 'FULLY' | 'SEMI' | 'NONE';
export type TenantType = 'FAMILY' | 'BACHELOR' | 'COMPANY' | 'ANY';
export type Availability = 'IMMEDIATE' | 'WITHIN15' | 'WITHIN30';

export interface DbUser {
    id: string;
    phone: string | null;
    email: string | null;
    name: string | null;
    avatar: string | null;
    google_id: string | null;
    role: UserRole;
    is_verified: boolean;
    credits: number;
    created_at: string;
    updated_at: string;
}

export interface DbProperty {
    id: string;
    title: string;
    description: string;
    type: PropertyType;
    listing_type: ListingType;
    status: PropertyStatus;
    price: number;
    deposit: number | null;
    maintenance: number | null;
    bhk: number;
    bathrooms: number;
    built_up_area: number;
    furnishing: Furnishing;
    tenant_type: TenantType;
    availability: Availability;
    locality: string;
    city: string;
    state: string;
    pincode: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    images: string[];
    amenities: string[];
    contact_phone: string | null;
    views: number;
    created_at: string;
    updated_at: string;
    owner_id: string;
}

export interface DbContactAccess {
    id: string;
    timestamp: string;
    viewer_id: string;
    property_id: string;
    owner_id: string;
}

// Create Supabase client (untyped for flexibility with complex queries)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
    },
});

// Helper to get current user
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Fetch user profile from our users table
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile as DbUser | null;
};

// Helper to transform snake_case to camelCase for frontend compatibility
export const transformUser = (dbUser: DbUser) => ({
    id: dbUser.id,
    phone: dbUser.phone,
    email: dbUser.email,
    name: dbUser.name,
    avatar: dbUser.avatar,
    googleId: dbUser.google_id,
    role: dbUser.role,
    isVerified: dbUser.is_verified,
    credits: dbUser.credits,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
});

export const transformProperty = (dbProperty: DbProperty & { owner?: DbUser }) => ({
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description,
    type: dbProperty.type,
    listingType: dbProperty.listing_type,
    status: dbProperty.status,
    price: dbProperty.price,
    deposit: dbProperty.deposit,
    maintenance: dbProperty.maintenance,
    bhk: dbProperty.bhk,
    bathrooms: dbProperty.bathrooms,
    builtUpArea: dbProperty.built_up_area,
    furnishing: dbProperty.furnishing,
    tenantType: dbProperty.tenant_type,
    availability: dbProperty.availability,
    locality: dbProperty.locality,
    city: dbProperty.city,
    state: dbProperty.state,
    pincode: dbProperty.pincode,
    address: dbProperty.address,
    latitude: dbProperty.latitude,
    longitude: dbProperty.longitude,
    images: dbProperty.images,
    amenities: dbProperty.amenities,
    contactPhone: dbProperty.contact_phone,
    views: dbProperty.views,
    createdAt: dbProperty.created_at,
    updatedAt: dbProperty.updated_at,
    ownerId: dbProperty.owner_id,
    owner: dbProperty.owner ? transformUser(dbProperty.owner) : undefined,
});

export default supabase;
