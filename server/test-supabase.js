// Import required modules
require('cross-fetch/polyfill');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Exists (not showing for security)' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
async function testConnection() {
  try {
    console.log('Testing connection to Supabase...');
    
    // Simple query to check connection
    const { data, error } = await supabase.from('health_check').select('*').limit(1).maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Connected to Supabase successfully (health_check table not found)');
        return;
      }
      
      throw error;
    }
    
    console.log('Connected to Supabase successfully');
    console.log('Data:', data);
  } catch (error) {
    console.error('Supabase connection error:', error);
  }
}

// Run the test
testConnection(); 