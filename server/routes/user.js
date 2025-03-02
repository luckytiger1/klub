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

// GET /api/user - Get all users
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      error: 'Failed to fetch users',
      details: error.message
    });
  }
});

// GET /api/user/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching user with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch user',
      details: error.message
    });
  }
});

// POST /api/user - Create a new user
router.post('/', async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ email, name, phone }])
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      error: 'Failed to create user',
      details: error.message
    });
  }
});

// PUT /api/user/:id - Update a user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, phone } = req.body;
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ email, name, phone })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error updating user with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to update user',
      details: error.message
    });
  }
});

// DELETE /api/user/:id - Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting user with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to delete user',
      details: error.message
    });
  }
});

// Export router
module.exports = router; 