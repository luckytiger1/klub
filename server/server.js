// Import required modules
require('cross-fetch/polyfill');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Import route files
const restaurantRoutes = require('./routes/restaurant');
const userRoutes = require('./routes/user');
const billRoutes = require('./routes/bill');
const paymentRoutes = require('./routes/payment');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to check if Supabase connection is working
const checkSupabaseConnection = async () => {
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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await checkSupabaseConnection();
    
    return res.status(dbStatus.success ? 200 : 500).json({
      status: 'ok',
      timestamp: new Date(),
      database: dbStatus
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server health check failed',
      error
    });
  }
});

// Use route files
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bill', billRoutes);
app.use('/api/payment', paymentRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
}); 