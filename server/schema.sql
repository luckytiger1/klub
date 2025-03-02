-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  cuisine TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open, paid, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bill_items table
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL, -- credit_card, debit_card, cash, etc.
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO restaurants (name, address, phone, cuisine, description)
VALUES 
  ('Sample Restaurant', '123 Main St', '555-1234', 'Italian', 'A sample Italian restaurant'),
  ('Test Cafe', '456 Oak Ave', '555-5678', 'Cafe', 'A cozy cafe with great coffee');

INSERT INTO profiles (email, name, phone)
VALUES 
  ('user1@example.com', 'User One', '555-1111'),
  ('user2@example.com', 'User Two', '555-2222');

-- Get the IDs of the inserted restaurants
WITH restaurant_ids AS (
  SELECT id FROM restaurants LIMIT 2
)
INSERT INTO qr_codes (restaurant_id, table_number)
SELECT id, 1 FROM restaurant_ids
UNION ALL
SELECT id, 2 FROM restaurant_ids
UNION ALL
SELECT id, 3 FROM restaurant_ids;

-- Create sample bills
WITH restaurant_ids AS (
  SELECT id FROM restaurants LIMIT 2
)
INSERT INTO bills (restaurant_id, table_number, total_amount, status)
SELECT id, 1, 45.50, 'open' FROM restaurant_ids
UNION ALL
SELECT id, 2, 32.75, 'paid' FROM restaurant_ids;

-- Get the IDs of the inserted bills
WITH bill_ids AS (
  SELECT id FROM bills LIMIT 2
)
INSERT INTO bill_items (bill_id, name, price, quantity)
SELECT id, 'Pasta Carbonara', 15.50, 2 FROM bill_ids
UNION ALL
SELECT id, 'Caesar Salad', 8.25, 1 FROM bill_ids
UNION ALL
SELECT id, 'Tiramisu', 6.25, 1 FROM bill_ids;

-- Create sample payments
WITH bill_ids AS (
  SELECT id FROM bills WHERE status = 'paid' LIMIT 1
),
user_ids AS (
  SELECT id FROM profiles LIMIT 1
)
INSERT INTO payments (bill_id, user_id, amount, payment_method, status)
SELECT bill_ids.id, user_ids.id, 32.75, 'credit_card', 'completed'
FROM bill_ids, user_ids; 