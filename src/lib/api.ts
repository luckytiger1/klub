import axios from 'axios';
import { supabase } from './supabase';

// Base URL for API requests
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create a public axios instance without auth requirements
// This will be used for all customer-facing features
const publicApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create an authenticated axios instance with auth token
// This will be used for restaurant owner features
const authenticatedApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token for authenticated requests
authenticatedApi.interceptors.request.use(async (config) => {
  try {
    // Get authenticated user data from Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return config;
    }
    
    // Verify the user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return config;
    }
    
    // Only add the token if we have a valid session and user
    if (sessionData?.session?.access_token && userData?.user) {
      config.headers.Authorization = `Bearer ${sessionData.session.access_token}`;
    }
    
    return config;
  } catch (error) {
    console.error('Authentication error:', error);
    return config;
  }
});

// Authentication API
export const authApi = {
  signUp: async (email: string, password: string, userData: any) => {
    // Register with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // Store additional user data in the metadata
      },
    });
    
    if (error) throw error;
    return data;
  },
  
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },
  
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    return data;
  },
  
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return data;
  },
  
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }
      
      if (!data || !data.user) {
        console.warn('No user data returned from getUser');
        return null;
      }
      
      return data.user;
    } catch (error) {
      console.error('Exception getting current user:', error);
      return null;
    }
  },
  
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      
      if (!data || !data.session) {
        console.warn('No session data returned from getSession');
        return null;
      }
      
      return data.session;
    } catch (error) {
      console.error('Exception getting session:', error);
      return null;
    }
  },
};

// Restaurant API - Public endpoints for customers, authenticated endpoints for owners
export const restaurantApi = {
  // Public endpoints (no authentication required)
  getAll: async () => {
    const response = await publicApi.get('/restaurant');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await publicApi.get(`/restaurant/${id}`);
    return response.data;
  },
  
  // Authenticated endpoints (for restaurant owners)
  create: async (data: any) => {
    const response = await authenticatedApi.post('/restaurant', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await authenticatedApi.put(`/restaurant/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await authenticatedApi.delete(`/restaurant/${id}`);
    return response.data;
  },
  generateQrCode: async (id: string, tableNumber: number) => {
    const response = await authenticatedApi.post(`/restaurant/${id}/qr-codes`, { tableNumber });
    return response.data;
  },
};

// User API - All endpoints require authentication
export const userApi = {
  getAll: async () => {
    const response = await authenticatedApi.get('/user');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await authenticatedApi.get(`/user/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await authenticatedApi.post('/user', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await authenticatedApi.put(`/user/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await authenticatedApi.delete(`/user/${id}`);
    return response.data;
  },
};

// Bill API - Public endpoints for customers
export const billApi = {
  getAll: async () => {
    const response = await publicApi.get('/bill');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await publicApi.get(`/bill/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await publicApi.post('/bill', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await publicApi.put(`/bill/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await publicApi.delete(`/bill/${id}`);
    return response.data;
  },
  getItems: async (id: string) => {
    const response = await publicApi.get(`/bill/${id}/items`);
    return response.data;
  },
  addItems: async (id: string, items: any[]) => {
    const response = await publicApi.post(`/bill/${id}/items`, { items });
    return response.data;
  },
};

// Payment API - Public endpoints for customers
export const paymentApi = {
  getAll: async () => {
    const response = await publicApi.get('/payment');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await publicApi.get(`/payment/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await publicApi.post('/payment', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await publicApi.put(`/payment/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await publicApi.delete(`/payment/${id}`);
    return response.data;
  },
  getByBill: async (billId: string) => {
    const response = await publicApi.get(`/payment/bill/${billId}`);
    return response.data;
  },
  getByUser: async (userId: string) => {
    const response = await publicApi.get(`/payment/user/${userId}`);
    return response.data;
  },
};

// Health check
export const healthApi = {
  check: async () => {
    const response = await publicApi.get('/health');
    return response.data;
  },
};

// Export both API clients
export { publicApi, authenticatedApi }; 