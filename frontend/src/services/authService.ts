// Auth Service using Supabase
import { supabase, DbUser } from '@/lib/supabase';

interface User {
    id: string;
    phone: string | null;
    name: string | null;
    email: string | null;
    role: 'BUYER' | 'OWNER' | 'ADMIN';
    isVerified: boolean;
    credits: number;
    avatar?: string | null;
}

// Helper to convert DB user to frontend user
function dbUserToUser(dbUser: DbUser): User {
    return {
        id: dbUser.id,
        phone: dbUser.phone,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        isVerified: dbUser.is_verified,
        credits: dbUser.credits,
        avatar: dbUser.avatar,
    };
}

// Auth Service for Supabase
export const authService = {
    // Sign in with Google OAuth
    async signInWithGoogle(): Promise<void> {
        const redirectUrl = import.meta.env.VITE_SITE_URL
            ? `${import.meta.env.VITE_SITE_URL}/auth/callback`
            : `${window.location.origin}/auth/callback`;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) throw error;
    },

    // Send OTP to phone (for phone auth)
    async sendOtp(phone: string): Promise<{ message: string }> {
        const { error } = await supabase.auth.signInWithOtp({
            phone: phone,
        });

        if (error) throw error;
        return { message: 'OTP sent successfully' };
    },

    // Verify OTP and login
    async verifyOtp(phone: string, otp: string): Promise<{ user: User; accessToken: string }> {
        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: 'sms',
        });

        if (error) throw error;
        if (!data.user || !data.session) {
            throw new Error('Verification failed');
        }

        // Get or create user profile
        const profile = await this.getOrCreateProfile(data.user.id, {
            phone,
            email: data.user.email || null,
            name: data.user.user_metadata?.name || null,
        });

        return {
            user: profile,
            accessToken: data.session.access_token,
        };
    },

    // Get or create user profile in our users table
    async getOrCreateProfile(
        userId: string,
        userData: { phone?: string | null; email?: string | null; name?: string | null; google_id?: string | null; avatar?: string | null }
    ): Promise<User> {
        // First try to get existing profile
        const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (existingProfile) {
            const dbUser = existingProfile as DbUser;
            return dbUserToUser(dbUser);
        }

        // Create new profile if doesn't exist
        const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
                id: userId,
                phone: userData.phone || null,
                email: userData.email || null,
                name: userData.name || null,
                google_id: userData.google_id || null,
                avatar: userData.avatar || null,
                role: 'BUYER',
                is_verified: true,
                credits: 9999,
            })
            .select()
            .single();

        if (createError) throw createError;
        if (!newProfile) throw new Error('Failed to create profile');

        const dbUser = newProfile as DbUser;
        return dbUserToUser(dbUser);
    },

    // Get current user
    async getMe(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            // If no profile exists, create one from auth user metadata
            return this.getOrCreateProfile(user.id, {
                email: user.email,
                name: user.user_metadata?.name,
                avatar: user.user_metadata?.avatar_url,
                google_id: user.user_metadata?.provider_id,
            });
        }

        const dbUser = profile as DbUser;
        return dbUserToUser(dbUser);
    },

    // Update profile
    async updateProfile(data: { name?: string; email?: string }): Promise<User> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const updateData: Record<string, string> = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;

        const { data: profile, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        if (!profile) throw new Error('Failed to update profile');

        const dbUser = profile as DbUser;
        return dbUserToUser(dbUser);
    },

    // Logout
    async logout(): Promise<void> {
        await supabase.auth.signOut();
        localStorage.removeItem('user');
    },

    // Get session
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // Check if logged in
    async isLoggedIn(): Promise<boolean> {
        const session = await this.getSession();
        return !!session;
    },

    // Subscribe to auth state changes
    onAuthStateChange(callback: (event: string, session: unknown) => void) {
        return supabase.auth.onAuthStateChange(callback);
    },
};

export default authService;
