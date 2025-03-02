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

// GET /api/bill - Get all bills
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*');
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return res.status(500).json({
      error: 'Failed to fetch bills',
      details: error.message
    });
  }
});

// GET /api/bill/:id - Get bill by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('bills')
      .select('*, bill_items(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching bill with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch bill',
      details: error.message
    });
  }
});

// POST /api/bill - Create a new bill
router.post('/', async (req, res) => {
  try {
    const { restaurant_id, table_number, total_amount, items } = req.body;
    
    if (!restaurant_id || !table_number || !total_amount) {
      return res.status(400).json({ error: 'Restaurant ID, table number, and total amount are required' });
    }
    
    // Create bill
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert([{ restaurant_id, table_number, total_amount }])
      .select()
      .single();
    
    if (billError) throw billError;
    
    // Create bill items if provided
    if (items && items.length > 0) {
      const billItems = items.map(item => ({
        bill_id: bill.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1
      }));
      
      const { error: itemsError } = await supabase
        .from('bill_items')
        .insert(billItems);
      
      if (itemsError) throw itemsError;
    }
    
    // Fetch the bill with items
    const { data: fullBill, error: fetchError } = await supabase
      .from('bills')
      .select('*, bill_items(*)')
      .eq('id', bill.id)
      .single();
    
    if (fetchError) throw fetchError;
    
    return res.status(201).json(fullBill);
  } catch (error) {
    console.error('Error creating bill:', error);
    return res.status(500).json({
      error: 'Failed to create bill',
      details: error.message
    });
  }
});

// PUT /api/bill/:id - Update a bill
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { restaurant_id, table_number, total_amount, status } = req.body;
    
    // Check if bill exists
    const { data: existingBill, error: fetchError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    const { data, error } = await supabase
      .from('bills')
      .update({ restaurant_id, table_number, total_amount, status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error updating bill with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to update bill',
      details: error.message
    });
  }
});

// DELETE /api/bill/:id - Delete a bill
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if bill exists
    const { data: existingBill, error: fetchError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting bill with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to delete bill',
      details: error.message
    });
  }
});

// GET /api/bill/:id/items - Get bill items
router.get('/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('bill_items')
      .select('*')
      .eq('bill_id', id);
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching items for bill with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch bill items',
      details: error.message
    });
  }
});

// POST /api/bill/:id/items - Add items to a bill
router.post('/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Items are required' });
    }
    
    // Check if bill exists
    const { data: existingBill, error: fetchError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    // Add bill_id to each item
    const billItems = items.map(item => ({
      bill_id: id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1
    }));
    
    const { data, error } = await supabase
      .from('bill_items')
      .insert(billItems)
      .select();
    
    if (error) throw error;
    
    // Update bill total
    const { data: updatedItems, error: itemsError } = await supabase
      .from('bill_items')
      .select('price, quantity')
      .eq('bill_id', id);
    
    if (itemsError) throw itemsError;
    
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const { error: updateError } = await supabase
      .from('bills')
      .update({ total_amount: newTotal })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    return res.status(201).json(data);
  } catch (error) {
    console.error(`Error adding items to bill with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to add items to bill',
      details: error.message
    });
  }
});

// Export router
module.exports = router; 