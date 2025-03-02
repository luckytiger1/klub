'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from './api';
import { supabase } from './supabase';

// Define the User type
export type User = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    role?: 'customer' | 'restaurant_owner' | 'admin';
  };
};

// Define the AuthContext type
type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const session = await authApi.getSession();
        
        if (session) {
          try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser as User);
          } catch (userError) {
            console.error('Error getting current user:', userError);
            setUser(null);
            setError('Failed to get user data');
          }
        } else {
          // No session found, ensure user is set to null
          setUser(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
        setUser(null);
      } finally {
        // Ensure loading is set to false regardless of success or failure
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session) {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser as User);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.signIn(email, password);
      
      // Redirect to dashboard after successful login
      router.push('/user');
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.signUp(email, password, userData);
      
      // Redirect to login page after successful registration
      router.push('/auth/login?registered=true');
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.signOut();
      
      // Redirect to home page after logout
      router.push('/');
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.resetPassword(email);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update password function
  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.updatePassword(newPassword);
    } catch (err: any) {
      console.error('Update password error:', err);
      setError(err.message || 'Failed to update password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create the context value
  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 