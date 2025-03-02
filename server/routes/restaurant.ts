import express from 'express';
import { supabase } from '../utils/supabase.js';

const router = express.Router();

// Get all restaurants
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
      details: error
    });
  }
});

// Get restaurant by ID
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
      details: error
    });
  }
});

// Create a new restaurant
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Restaurant name is required' });
    }
    
    const { data, error } = await supabase
      .from('restaurants')
      .insert([{ name, address, phone, email }])
      .select();
    
    if (error) throw error;
    
    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return res.status(500).json({
      error: 'Failed to create restaurant',
      details: error
    });
  }
});

// Update a restaurant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email } = req.body;
    
    const { data, error } = await supabase
      .from('restaurants')
      .update({ name, address, phone, email })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error(`Error updating restaurant with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to update restaurant',
      details: error
    });
  }
});

// Delete a restaurant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
      details: error
    });
  }
});

// Generate QR code for a table
router.post('/:id/qr-codes', async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber } = req.body;
    
    if (!tableNumber) {
      return res.status(400).json({ error: 'Table number is required' });
    }
    
    // First check if the restaurant exists
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', id)
      .single();
    
    if (restaurantError || !restaurant) {
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
      .select();
    
    if (error) throw error;
    
    return res.status(201).json(data[0]);
  } catch (error) {
    console.error(`Error generating QR code for restaurant ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to generate QR code',
      details: error
    });
  }
});

export default router; 