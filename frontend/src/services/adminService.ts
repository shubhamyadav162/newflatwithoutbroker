// Admin Service using Supabase
import { supabase, DbUser, DbProperty } from '@/lib/supabase';

// Check if current user is admin
export const isAdmin = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'ADMIN';
};

// Dashboard Stats
export const getDashboardStats = async () => {
    const [usersResult, propertiesResult, contactsResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('contact_access').select('*', { count: 'exact', head: true }),
    ]);

    const activeProperties = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

    return {
        totalUsers: usersResult.count || 0,
        totalProperties: propertiesResult.count || 0,
        totalContacts: contactsResult.count || 0,
        activeProperties: activeProperties.count || 0,
    };
};

// User Management
export const getAllUsers = async (params?: { page?: number; limit?: number; search?: string }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

    if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,phone.ilike.%${params.search}%`);
    }

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    // Map Supabase snake_case to frontend camelCase
    const mappedUsers = (data || []).map((user: any) => ({
        ...user,
        createdAt: user.created_at,
        isVerified: user.is_verified,
        listingType: user.listing_type,
    }));

    return {
        users: mappedUsers,
        total: count || 0,
        page,
        limit,
    };
};

export const getUserById = async (id: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;

    // Map single user
    const user: any = data;
    return {
        ...user,
        createdAt: user.created_at,
        isVerified: user.is_verified,
    };
};

export const updateUser = async (id: string, updates: any) => {
    // Map camelCase updates to snake_case for DB
    const dbUpdates: any = { ...updates };
    if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;
    if (updates.listingType !== undefined) dbUpdates.listing_type = updates.listingType;
    if (updates.createdAt !== undefined) delete dbUpdates.createdAt; // Don't update timestamps manually usually

    const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteUser = async (id: string) => {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
};

// Property Management
export const getAllProperties = async (params?: { page?: number; limit?: number; status?: string; search?: string; type?: string; listingType?: string; city?: string; minPrice?: number; maxPrice?: number }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('properties')
        .select(`
            *,
            owner:users!properties_owner_id_fkey (id, name, email, phone)
        `, { count: 'exact' });

    if (params?.status) query = query.eq('status', params.status);
    if (params?.type) query = query.eq('type', params.type);
    if (params?.listingType) query = query.eq('listing_type', params.listingType); // DB column listing_type
    if (params?.city) query = query.ilike('city', `%${params.city}%`);
    if (params?.minPrice) query = query.gte('price', params.minPrice);
    if (params?.maxPrice) query = query.lte('price', params.maxPrice);

    if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,city.ilike.%${params.search}%,locality.ilike.%${params.search}%`);
    }

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    // Map properties
    const mappedProperties = (data || []).map((p: any) => ({
        ...p,
        createdAt: p.created_at,
        listingType: p.listing_type,
        // Ensure contacts count is handled if needed, or if it was part of standard select
        // For now, if we need contact count, we might need a separate query or View in Supabase
        // But the previous mock had it. Let's assume we might lack it for now or add it later.
    }));

    return {
        properties: mappedProperties,
        total: count || 0,
        page,
        limit,
    };
};

export const updatePropertyStatus = async (id: string, status: string) => {
    const { data, error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteProperty = async (id: string) => {
    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
};

// Contact History
export const getContactHistory = async (params?: { page?: number; limit?: number }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
        .from('contact_access')
        .select(`
            *,
            viewer:users!contact_access_viewer_id_fkey (id, name, email, phone),
            property:properties!contact_access_property_id_fkey (id, title, city, locality),
            owner:users!contact_access_owner_id_fkey (id, name, phone)
        `, { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range(from, to);

    if (error) throw error;

    return {
        contacts: data || [],
        total: count || 0,
        page,
        limit,
    };
};

// Analytics
export const getAnalyticsData = async (days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get new users in period
    const { count: newUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

    // Get new properties in period
    const { count: newProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

    // Get contacts in period
    const { count: contactsMade } = await supabase
        .from('contact_access')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', startDate.toISOString());

    return {
        newUsers: newUsers || 0,
        newProperties: newProperties || 0,
        contactsMade: contactsMade || 0,
        period: days,
    };
};

// Activity Logs (using contact_access as activity)
export const getActivityLogs = async (limit: number = 20) => {
    const { data, error } = await supabase
        .from('contact_access')
        .select(`
            *,
            viewer:users!contact_access_viewer_id_fkey (name, email),
            property:properties!contact_access_property_id_fkey (title)
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

    if (error) throw error;

    return (data || []).map(log => ({
        id: log.id,
        action: 'contact_revealed',
        user: (log.viewer as any)?.name || 'Unknown',
        details: `Viewed contact for: ${(log.property as any)?.title || 'Unknown property'}`,
        timestamp: log.timestamp,
    }));
};
