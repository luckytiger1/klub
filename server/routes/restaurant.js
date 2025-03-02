// Import required modules
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create router
const router = express.Router();

// GET /api/restaurant - Get all restaurants
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*');
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return res.status(500).json({
      error: 'Failed to fetch restaurants',
      details: error.message
    });
  }
});

// GET /api/restaurant/:id - Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching restaurant with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch restaurant',
      details: error.message
    });
  }
});

// POST /api/restaurant - Create a new restaurant
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, cuisine, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Restaurant name is required' });
    }
    
    const { data, error } = await supabase
      .from('restaurants')
      .insert([{ name, address, phone, cuisine, description }])
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return res.status(500).json({
      error: 'Failed to create restaurant',
      details: error.message
    });
  }
});

// PUT /api/restaurant/:id - Update a restaurant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, cuisine, description } = req.body;
    
    // Check if restaurant exists
    const { data: existingRestaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const { data, error } = await supabase
      .from('restaurants')
      .update({ name, address, phone, cuisine, description })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error updating restaurant with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to update restaurant',
      details: error.message
    });
  }
});

// DELETE /api/restaurant/:id - Delete a restaurant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if restaurant exists
    const { data: existingRestaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting restaurant with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to delete restaurant',
      details: error.message
    });
  }
});

// POST /api/restaurant/:id/qr-codes - Generate QR code for a table
router.post('/:id/qr-codes', async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber } = req.body;
    
    if (!tableNumber) {
      return res.status(400).json({ error: 'Table number is required' });
    }
    
    // Check if restaurant exists
    const { data: existingRestaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Create QR code entry
    const { data, error } = await supabase
      .from('qr_codes')
      .insert([{
        restaurant_id: id,
        table_number: tableNumber,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(201).json({
      ...data,
      qr_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/scan?code=${data.id}`
    });
  } catch (error) {
    console.error(`Error generating QR code for restaurant ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to generate QR code',
      details: error.message
    });
  }
});

// Export router
module.exports = router; 