import express, { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

const router = express.Router();

// Get user profile
router.get('/profile/:id', async (req: Request, res: Response) => {
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
    console.error(`Error fetching user profile with ID ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch user profile',
      details: error
    });
  }
});

// Get user bills
router.get('/:id/bills', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        restaurant:restaurants(id, name)
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching bills for user ${req.params.id}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch user bills',
      details: error
    });
  }
});

// Get bill details
router.get('/bills/:billId', async (req: Request, res: Response) => {
  try {
    const { billId } = req.params;
    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        restaurant:restaurants(id, name, address),
        items:bill_items(
          id, 
          name, 
          price, 
          quantity,
          split_with:bill_item_splits(user_id)
        )
      `)
      .eq('id', billId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching bill with ID ${req.params.billId}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch bill details',
      details: error
    });
  }
});

// Process bill payment
router.post('/bills/:billId/pay', async (req: Request, res: Response) => {
  try {
    const { billId } = req.params;
    const { userId, amount, paymentMethod, itemIds } = req.body;
    
    // Validate required fields
    if (!userId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['userId', 'amount', 'paymentMethod'] 
      });
    }
    
    // Start a transaction
    const { data, error } = await supabase.rpc('process_bill_payment', {
      p_bill_id: billId,
      p_user_id: userId,
      p_amount: amount,
      p_payment_method: paymentMethod,
      p_item_ids: itemIds || []
    });
    
    if (error) throw error;
    
    return res.status(200).json({
      success: true,
      payment: data
    });
  } catch (error) {
    console.error(`Error processing payment for bill ${req.params.billId}:`, error);
    return res.status(500).json({
      error: 'Failed to process payment',
      details: error
    });
  }
});

// Split bill item
router.post('/bills/:billId/items/:itemId/split', async (req: Request, res: Response) => {
  try {
    const { billId, itemId } = req.params;
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }
    
    // Create split entries
    const splitEntries = userIds.map(userId => ({
      bill_id: billId,
      item_id: itemId,
      user_id: userId
    }));
    
    const { data, error } = await supabase
      .from('bill_item_splits')
      .insert(splitEntries)
      .select();
    
    if (error) throw error;
    
    return res.status(201).json(data);
  } catch (error) {
    console.error(`Error splitting bill item ${req.params.itemId}:`, error);
    return res.status(500).json({
      error: 'Failed to split bill item',
      details: error
    });
  }
});

export default router; 