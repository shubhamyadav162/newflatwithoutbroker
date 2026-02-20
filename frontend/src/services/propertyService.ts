// Property API Service using Supabase
import { supabase, DbProperty, DbUser } from '@/lib/supabase';
import { Property, PropertyFormData, SearchFilters, PaginationInfo, ContactInfo, ContactHistoryItem } from '@/types/property';

// Transform database property to frontend property
function transformProperty(dbProp: DbProperty & { owner?: DbUser }): Property {
    return {
        id: dbProp.id,
        title: dbProp.title,
        description: dbProp.description,
        type: dbProp.type,
        listingType: dbProp.listing_type,
        status: dbProp.status,
        price: dbProp.price,
        deposit: dbProp.deposit ?? undefined,
        maintenance: dbProp.maintenance ?? undefined,
        bhk: dbProp.bhk,
        bathrooms: dbProp.bathrooms,
        builtUpArea: dbProp.built_up_area,
        furnishing: dbProp.furnishing,
        tenantType: dbProp.tenant_type,
        availability: dbProp.availability,
        locality: dbProp.locality,
        city: dbProp.city,
        state: dbProp.state,
        pincode: dbProp.pincode ?? undefined,
        address: dbProp.address ?? undefined,
        latitude: dbProp.latitude ?? undefined,
        longitude: dbProp.longitude ?? undefined,
        images: dbProp.images || [],
        amenities: dbProp.amenities || [],
        contactPhone: dbProp.contact_phone ?? undefined,
        views: dbProp.views,
        createdAt: dbProp.created_at,
        updatedAt: dbProp.updated_at,
        ownerId: dbProp.owner_id,
        owner: dbProp.owner ? {
            id: dbProp.owner.id,
            name: dbProp.owner.name,
            isVerified: dbProp.owner.is_verified,
            phone: dbProp.owner.phone ?? undefined,
            avatar: dbProp.owner.avatar,
        } : {
            id: dbProp.owner_id,
            name: null,
            isVerified: false,
        },
    };
}

// Get all properties with pagination
export async function getProperties(page = 1, limit = 20): Promise<{ properties: Property[]; pagination: PaginationInfo }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get count first
    const { count, error: countError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

    if (countError) throw countError;

    // Get properties with owner
    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            owner:users!properties_owner_id_fkey (*)
        `)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    const total = count || 0;
    const rawData = (data || []) as unknown as (DbProperty & { owner?: DbUser })[];
    const properties = rawData.map(transformProperty);

    return {
        properties,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// Get a single property by ID
export async function getPropertyById(id: string): Promise<Property> {
    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            owner:users!properties_owner_id_fkey (*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    if (!data) throw new Error('Property not found');

    const dbProperty = data as unknown as DbProperty & { owner?: DbUser };

    // Increment views
    await supabase
        .from('properties')
        .update({ views: (dbProperty.views || 0) + 1 })
        .eq('id', id);

    return transformProperty(dbProperty);
}

// Create a new property
export async function createProperty(formData: PropertyFormData): Promise<Property> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('properties')
        .insert({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            listing_type: formData.listingType,
            status: 'ACTIVE',
            price: formData.price,
            deposit: formData.deposit ?? null,
            maintenance: formData.maintenance ?? null,
            bhk: formData.bhk,
            bathrooms: formData.bathrooms,
            built_up_area: formData.builtUpArea,
            furnishing: formData.furnishing,
            tenant_type: formData.tenantType ?? 'ANY',
            availability: formData.availability ?? 'IMMEDIATE',
            locality: formData.locality,
            city: formData.city,
            state: formData.state ?? 'Maharashtra',
            pincode: formData.pincode ?? null,
            address: formData.address ?? null,
            images: formData.images || [],
            amenities: formData.amenities || [],
            contact_phone: formData.contactPhone ?? null,
            owner_id: user.id,
        })
        .select(`
            *,
            owner:users!properties_owner_id_fkey (*)
        `)
        .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create property');

    const dbProperty = data as unknown as DbProperty & { owner?: DbUser };
    return transformProperty(dbProperty);
}

// Update a property
export async function updateProperty(id: string, formData: Partial<PropertyFormData>): Promise<Property> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Build update object with snake_case keys
    const updateData: Record<string, unknown> = {};
    if (formData.title !== undefined) updateData.title = formData.title;
    if (formData.description !== undefined) updateData.description = formData.description;
    if (formData.type !== undefined) updateData.type = formData.type;
    if (formData.listingType !== undefined) updateData.listing_type = formData.listingType;
    if (formData.price !== undefined) updateData.price = formData.price;
    if (formData.deposit !== undefined) updateData.deposit = formData.deposit;
    if (formData.maintenance !== undefined) updateData.maintenance = formData.maintenance;
    if (formData.bhk !== undefined) updateData.bhk = formData.bhk;
    if (formData.bathrooms !== undefined) updateData.bathrooms = formData.bathrooms;
    if (formData.builtUpArea !== undefined) updateData.built_up_area = formData.builtUpArea;
    if (formData.furnishing !== undefined) updateData.furnishing = formData.furnishing;
    if (formData.tenantType !== undefined) updateData.tenant_type = formData.tenantType;
    if (formData.availability !== undefined) updateData.availability = formData.availability;
    if (formData.locality !== undefined) updateData.locality = formData.locality;
    if (formData.city !== undefined) updateData.city = formData.city;
    if (formData.state !== undefined) updateData.state = formData.state;
    if (formData.pincode !== undefined) updateData.pincode = formData.pincode;
    if (formData.address !== undefined) updateData.address = formData.address;
    if (formData.images !== undefined) updateData.images = formData.images;
    if (formData.amenities !== undefined) updateData.amenities = formData.amenities;
    if (formData.contactPhone !== undefined) updateData.contact_phone = formData.contactPhone;

    const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id)
        .eq('owner_id', user.id) // Ensure user owns the property
        .select(`
            *,
            owner:users!properties_owner_id_fkey (*)
        `)
        .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update property or not authorized');

    const dbProperty = data as unknown as DbProperty & { owner?: DbUser };
    return transformProperty(dbProperty);
}

// Delete a property
export async function deleteProperty(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id); // Ensure user owns the property

    if (error) throw error;
}

// Get user's own properties
export async function getMyProperties(): Promise<Property[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            owner:users!properties_owner_id_fkey (*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const rawData = (data || []) as unknown as (DbProperty & { owner?: DbUser })[];
    return rawData.map(transformProperty);
}

// Search properties
export async function searchProperties(filters: SearchFilters): Promise<{ properties: Property[]; pagination: PaginationInfo; filters: SearchFilters }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('properties')
        .select(`
            *,
            owner:users!properties_owner_id_fkey (*)
        `, { count: 'exact' })
        .eq('status', 'ACTIVE');

    // Apply filters
    if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.locality) {
        query = query.ilike('locality', `%${filters.locality}%`);
    }
    if (filters.type) {
        query = query.eq('type', filters.type);
    }
    if (filters.listingType) {
        query = query.eq('listing_type', filters.listingType);
    }
    if (filters.bhk) {
        query = query.eq('bhk', filters.bhk);
    }
    if (filters.furnishing) {
        query = query.eq('furnishing', filters.furnishing);
    }
    if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
    }
    if (filters.q) {
        query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%,locality.ilike.%${filters.q}%`);
    }

    // Apply pagination and ordering
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    const total = count || 0;
    const rawData = (data || []) as unknown as (DbProperty & { owner?: DbUser })[];
    const properties = rawData.map(transformProperty);

    return {
        properties,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        filters,
    };
}

// Reveal owner contact
export async function revealContact(propertyId: string): Promise<ContactInfo> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get property with owner
    const { data: property, error: propError } = await supabase
        .from('properties')
        .select(`
            *,
            owner:users!properties_owner_id_fkey (*)
        `)
        .eq('id', propertyId)
        .single();

    if (propError) throw propError;
    if (!property) throw new Error('Property not found');

    const dbProperty = property as unknown as DbProperty & { owner?: DbUser };

    // Record contact access
    await supabase.from('contact_access').insert({
        viewer_id: user.id,
        property_id: propertyId,
        owner_id: dbProperty.owner_id,
    });

    return {
        ownerName: dbProperty.owner?.name || 'Owner',
        ownerPhone: dbProperty.contact_phone || dbProperty.owner?.phone || 'N/A',
        isVerified: dbProperty.owner?.is_verified || false,
        propertyTitle: dbProperty.title,
    };
}

// Get contact history
export async function getContactHistory(): Promise<ContactHistoryItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('contact_access')
        .select(`
            id,
            timestamp,
            property:properties!contact_access_property_id_fkey (id, title, city, locality),
            owner:users!contact_access_owner_id_fkey (name, phone)
        `)
        .eq('viewer_id', user.id)
        .order('timestamp', { ascending: false });

    if (error) throw error;

    interface ContactAccessRaw {
        id: string;
        timestamp: string;
        property: { id: string; title: string; city: string; locality: string } | null;
        owner: { name: string | null; phone: string | null } | null;
    }

    const rawData = (data || []) as unknown as ContactAccessRaw[];

    return rawData.map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        property: {
            id: item.property?.id || '',
            title: item.property?.title || '',
            city: item.property?.city || '',
            locality: item.property?.locality || '',
        },
        owner: {
            name: item.owner?.name || 'Owner',
            phone: item.owner?.phone || 'N/A',
        },
    }));
}

// Get cities (for dropdown)
export async function getCities(): Promise<{ city: string; count: number }[]> {
    const { data, error } = await supabase
        .from('properties')
        .select('city')
        .eq('status', 'ACTIVE');

    if (error) throw error;

    interface CityRow { city: string }
    const rawData = (data || []) as CityRow[];

    // Group by city and count
    const cityCount = rawData.reduce((acc, prop) => {
        acc[prop.city] = (acc[prop.city] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(cityCount)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count);
}
