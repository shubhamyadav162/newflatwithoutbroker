// Property Types that match backend schema

export type PropertyType = 'APARTMENT' | 'VILLA' | 'PG' | 'SHOP' | 'OFFICE' | 'PLOT';
export type ListingType = 'RENT' | 'SELL';
export type PropertyStatus = 'ACTIVE' | 'SOLD' | 'RENTED' | 'INACTIVE';
export type Furnishing = 'FULLY' | 'SEMI' | 'NONE';
export type TenantType = 'FAMILY' | 'BACHELOR' | 'COMPANY' | 'ANY';
export type Availability = 'IMMEDIATE' | 'WITHIN15' | 'WITHIN30';

export interface PropertyOwner {
    id: string;
    name: string | null;
    isVerified: boolean;
    phone?: string;
    avatar?: string | null;
}

export interface Property {
    id: string;
    title: string;
    description: string;
    type: PropertyType;
    listingType: ListingType;
    status: PropertyStatus;

    // Pricing
    price: number;
    deposit?: number;
    maintenance?: number;

    // Details
    bhk: number;
    bathrooms: number;
    builtUpArea: number;
    furnishing: Furnishing;
    tenantType: TenantType;
    availability: Availability;

    // Location
    locality: string;
    city: string;
    state: string;
    pincode?: string;
    address?: string;
    latitude?: number;
    longitude?: number;

    // Media
    images: string[];
    amenities: string[];
    contactPhone?: string;

    // Stats
    views: number;

    // Timestamps
    createdAt: string;
    updatedAt: string;

    // Relations
    ownerId: string;
    owner: PropertyOwner;
}

export interface PropertyFormData {
    title: string;
    description: string;
    type: PropertyType;
    listingType: ListingType;
    price: number;
    deposit?: number;
    maintenance?: number;
    bhk: number;
    bathrooms: number;
    builtUpArea: number;
    furnishing: Furnishing;
    tenantType?: TenantType;
    availability?: Availability;
    locality: string;
    city: string;
    state?: string;
    pincode?: string;
    address?: string;
    images: string[];
    amenities?: string[];
    contactPhone?: string;
}

export interface SearchFilters {
    q?: string;
    city?: string;
    locality?: string;
    type?: PropertyType;
    listingType?: ListingType;
    bhk?: number;
    minPrice?: number;
    maxPrice?: number;
    furnishing?: Furnishing;
    page?: number;
    limit?: number;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ContactInfo {
    ownerName: string;
    ownerPhone: string;
    isVerified: boolean;
    propertyTitle: string;
}

export interface ContactHistoryItem {
    id: string;
    timestamp: string;
    property: {
        id: string;
        title: string;
        city: string;
        locality: string;
    };
    owner: {
        name: string;
        phone: string;
    };
}
