import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import 'cross-fetch/polyfill';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase connection is working
export const checkSupabaseConnection = async () => {
  try {
    // Try to query a table that definitely exists in Supabase
    const { data, error } = await supabase.from('restaurants').select('count').limit(1);
    
    if (error) {
      // If the table doesn't exist, try another common table
      if (error.code === '42P01') {
        const { error: profilesError } = await supabase.from('profiles').select('count').limit(1);
        
        if (profilesError && profilesError.code === '42P01') {
          // If neither table exists, just check if we can connect to Supabase at all
          await supabase.auth.getSession();
          return { 
            success: true, 
            message: 'Connected to Supabase successfully (no tables found)' 
          };
        } else if (profilesError) {
          throw profilesError;
        }
        
        return { 
          success: true, 
          message: 'Connected to Supabase successfully (profiles table found)' 
        };
      }
      
      throw error;
    }
    
    return { 
      success: true, 
      message: 'Connected to Supabase successfully (restaurants table found)' 
    };
  } catch (error) {
    console.error('Supabase connection error:', error);
    return { 
      success: false, 
      message: 'Failed to connect to Supabase',
      error
    };
  }
}; 