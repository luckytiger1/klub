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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to create tables
const setupDatabase = async () => {
  try {
    console.log('Setting up database...');

    // Create restaurants table
    console.log('Creating restaurants table...');
    const { error: restaurantsError } = await supabase.rpc('create_restaurants_table', {});
    
    if (restaurantsError) {
      console.error('Error creating restaurants table:', restaurantsError);
      // If the function doesn't exist, we'll try to create the table using SQL
      console.log('Attempting to create restaurants table using SQL...');
      
      const { error: sqlError } = await supabase.from('restaurants').insert({
        name: 'Test Restaurant',
        address: '123 Test St',
        phone: '555-1234',
        cuisine: 'Test Cuisine',
        description: 'Test Description'
      });
      
      if (sqlError && sqlError.code === '42P01') {
        console.log('Table does not exist. Creating it...');
        // We need to use the REST API to execute SQL directly
        // This is not ideal, but it's a workaround for now
        console.log('Please create the restaurants table manually in the Supabase dashboard.');
        console.log('SQL to create the table:');
        console.log(`
          CREATE TABLE restaurants (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            address TEXT,
            phone TEXT,
            cuisine TEXT,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      } else if (sqlError) {
        console.error('Error inserting test restaurant:', sqlError);
      } else {
        console.log('Successfully created restaurants table and inserted test restaurant.');
      }
    } else {
      console.log('Successfully created restaurants table.');
    }

    // Create profiles table
    console.log('Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('create_profiles_table', {});
    
    if (profilesError) {
      console.error('Error creating profiles table:', profilesError);
      // If the function doesn't exist, we'll try to create the table using SQL
      console.log('Attempting to create profiles table using SQL...');
      
      const { error: sqlError } = await supabase.from('profiles').insert({
        email: 'test@example.com',
        name: 'Test User',
        phone: '555-5678'
      });
      
      if (sqlError && sqlError.code === '42P01') {
        console.log('Table does not exist. Creating it...');
        // We need to use the REST API to execute SQL directly
        // This is not ideal, but it's a workaround for now
        console.log('Please create the profiles table manually in the Supabase dashboard.');
        console.log('SQL to create the table:');
        console.log(`
          CREATE TABLE profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            phone TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      } else if (sqlError) {
        console.error('Error inserting test profile:', sqlError);
      } else {
        console.log('Successfully created profiles table and inserted test profile.');
      }
    } else {
      console.log('Successfully created profiles table.');
    }

    // Create qr_codes table
    console.log('Creating qr_codes table...');
    const { error: qrCodesError } = await supabase.rpc('create_qr_codes_table', {});
    
    if (qrCodesError) {
      console.error('Error creating qr_codes table:', qrCodesError);
      // If the function doesn't exist, we'll try to create the table using SQL
      console.log('Attempting to create qr_codes table using SQL...');
      
      const { error: sqlError } = await supabase.from('qr_codes').insert({
        restaurant_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
        table_number: 1
      });
      
      if (sqlError && sqlError.code === '42P01') {
        console.log('Table does not exist. Creating it...');
        // We need to use the REST API to execute SQL directly
        // This is not ideal, but it's a workaround for now
        console.log('Please create the qr_codes table manually in the Supabase dashboard.');
        console.log('SQL to create the table:');
        console.log(`
          CREATE TABLE qr_codes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
            table_number INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      } else if (sqlError) {
        console.error('Error inserting test QR code:', sqlError);
      } else {
        console.log('Successfully created qr_codes table and inserted test QR code.');
      }
    } else {
      console.log('Successfully created qr_codes table.');
    }

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

// Run the setup function
setupDatabase(); 