import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  avatar?: string | null;
  role: string;
  isVerified: boolean;
  phone?: string | null;
  credits?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from our users table
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      // Get or create profile
      const profile = await authService.getOrCreateProfile(supabaseUser.id, {
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
        avatar: supabaseUser.user_metadata?.avatar_url,
        google_id: supabaseUser.app_metadata?.provider === 'google' ? supabaseUser.id : null,
      });

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        role: profile.role,
        isVerified: profile.isVerified,
        phone: profile.phone,
        credits: profile.credits,
      };
    } catch (error) {
      console.error('Error fetching user profile from DB, using auth metadata as fallback:', error);
      // Fallback: build user from Supabase auth metadata so UI still works
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || null,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
        avatar: supabaseUser.user_metadata?.avatar_url || null,
        role: 'BUYER',
        isVerified: true,
        phone: supabaseUser.phone || null,
        credits: 0,
      };
    }
  };

  // Handle setting user + session together
  const handleUserSession = async (supabaseUser: SupabaseUser, newSession: Session) => {
    console.log('Setting up user profile for:', supabaseUser.email);
    const profile = await fetchUserProfile(supabaseUser);
    console.log('Profile loaded:', profile.name, profile.email);
    setUser(profile);
    setSession(newSession);
    setIsLoading(false);
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Listen for ALL auth changes including INITIAL_SESSION
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('--- AUTH SYSTEM BY ANTIGRAVITY (FEB 20) ---');
        console.log('Auth state changed:', event, newSession?.user?.email);

        if (!mounted) return;

        if (newSession?.user) {
          // Handle SIGNED_IN, INITIAL_SESSION, TOKEN_REFRESHED - any event with a session
          await handleUserSession(newSession.user, newSession);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION' && !newSession) {
          // No session exists at all
          setIsLoading(false);
        }
      }
    );

    // Also try getSession as a safety net
    const initAuth = async () => {
      try {
        // Check if there's a ?code= in the URL that needs to be exchanged
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          console.log('Found auth code in URL, exchanging for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Code exchange error:', error);
          } else if (data.session && mounted) {
            console.log('Code exchange successful:', data.session.user.email);
            await handleUserSession(data.session.user, data.session);
            // Clean up URL - remove the ?code= parameter
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
            return;
          }
        }

        // Normal session check
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user && mounted) {
          await handleUserSession(initialSession.user, initialSession);
        } else if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login with Google OAuth
  const loginWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  // Legacy login (for OTP flow)
  const login = async (accessToken: string, refreshToken: string) => {
    try {
      // Set the session manually (for compatibility with OTP flow)
      const { data: { session: newSession }, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) throw error;

      if (newSession?.user) {
        await handleUserSession(newSession.user, newSession);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const profile = await fetchUserProfile(supabaseUser);
        setUser(profile);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user && !!session,
    isLoading,
    session,
    login,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
