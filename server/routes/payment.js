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

// GET /api/payment - Get all payments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*');
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({
      error: 'Failed to fetch payments',
      details: error.message
    });
  }
});

// GET /api/payment/:id - Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching payment with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch payment',
      details: error.message
    });
  }
});

// POST /api/payment - Create a new payment
router.post('/', async (req, res) => {
  try {
    const { bill_id, user_id, amount, payment_method } = req.body;
    
    if (!bill_id || !amount || !payment_method) {
      return res.status(400).json({ error: 'Bill ID, amount, and payment method are required' });
    }
    
    // Check if bill exists
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', bill_id)
      .single();
    
    if (billError || !bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    // Create payment
    const { data, error } = await supabase
      .from('payments')
      .insert([{ bill_id, user_id, amount, payment_method }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Check if bill is fully paid
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('bill_id', bill_id)
      .eq('status', 'completed');
    
    if (paymentsError) throw paymentsError;
    
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Update bill status if fully paid
    if (totalPaid >= bill.total_amount) {
      const { error: updateError } = await supabase
        .from('bills')
        .update({ status: 'paid' })
        .eq('id', bill_id);
      
      if (updateError) throw updateError;
    }
    
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({
      error: 'Failed to create payment',
      details: error.message
    });
  }
});

// PUT /api/payment/:id - Update a payment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_method, status } = req.body;
    
    // Check if payment exists
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const { data, error } = await supabase
      .from('payments')
      .update({ amount, payment_method, status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // If payment status changed to completed, check if bill is fully paid
    if (status === 'completed' && existingPayment.status !== 'completed') {
      const { data: bill, error: billError } = await supabase
        .from('bills')
        .select('*')
        .eq('id', existingPayment.bill_id)
        .single();
      
      if (billError) throw billError;
      
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('bill_id', existingPayment.bill_id)
        .eq('status', 'completed');
      
      if (paymentsError) throw paymentsError;
      
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Update bill status if fully paid
      if (totalPaid >= bill.total_amount) {
        const { error: updateError } = await supabase
          .from('bills')
          .update({ status: 'paid' })
          .eq('id', existingPayment.bill_id);
        
        if (updateError) throw updateError;
      }
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error updating payment with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to update payment',
      details: error.message
    });
  }
});

// DELETE /api/payment/:id - Delete a payment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if payment exists
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting payment with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to delete payment',
      details: error.message
    });
  }
});

// GET /api/payment/bill/:billId - Get payments for a bill
router.get('/bill/:billId', async (req, res) => {
  try {
    const { billId } = req.params;
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('bill_id', billId);
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching payments for bill with ID ${req.params.billId}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch payments for bill',
      details: error.message
    });
  }
});

// GET /api/payment/user/:userId - Get payments for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching payments for user with ID ${req.params.userId}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch payments for user',
      details: error.message
    });
  }
});

// Export router
module.exports = router; 