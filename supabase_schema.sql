-- AETHER Database Schema - New Tables
-- Run this in your Supabase SQL Editor to create the missing tables

-- Stock Notifications Table
-- For back-in-stock email notifications
CREATE TABLE IF NOT EXISTS stock_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, email)
);

CREATE INDEX IF NOT EXISTS idx_stock_notifications_product ON stock_notifications(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_notifications_email ON stock_notifications(email);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'shipping')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);

-- Seed Promo Codes
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, expires_at, is_active) VALUES
  ('WELCOME10', 'percent', 10, 0, NULL, NULL, true),
  ('AETHER20', 'percent', 20, 0, 100, NULL, true),
  ('FREESHIP', 'shipping', 0, 50, NULL, NULL, true),
  ('SAVE50', 'fixed', 50, 200, 50, NULL, true),
  ('VIP30', 'percent', 30, 100, 200, NULL, true)
ON CONFLICT (code) DO NOTHING;

-- Product Questions Table (Q&A)
CREATE TABLE IF NOT EXISTS product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_questions_product ON product_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_questions_user ON product_questions(user_id);

-- Seed Q&A for some products (adjust product_ids based on your actual data)
-- These will be updated after products are loaded
DO $$
DECLARE
  product_uuid UUID;
BEGIN
  -- Get first product ID for seeding
  SELECT id INTO product_uuid FROM products LIMIT 1;
  
  IF product_uuid IS NOT NULL THEN
    INSERT INTO product_questions (product_id, user_id, question, answer, answered_at, created_at) VALUES
      (product_uuid, NULL, 'Is this product available in other colors?', 'Yes! This product comes in multiple colors. Check the color selector on the product page.', NOW(), NOW() - INTERVAL '5 days'),
      (product_uuid, NULL, 'What is the warranty period?', 'All AETHER products come with a 2-year manufacturer warranty.', NOW(), NOW() - INTERVAL '3 days'),
      (product_uuid, NULL, 'Does this ship internationally?', 'Yes, we offer free worldwide shipping on all orders.', NULL, NOW() - INTERVAL '1 day')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Add alert_enabled column to wishlist table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishlist' AND column_name = 'alert_enabled'
  ) THEN
    ALTER TABLE wishlist ADD COLUMN alert_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add loyalty_points column to auth.users metadata (handled in application)
-- Create a user_profiles table for extended user data
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, loyalty_points)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to add loyalty points
CREATE OR REPLACE FUNCTION add_loyalty_points(user_uuid UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_profiles (id, loyalty_points)
  VALUES (user_uuid, points)
  ON CONFLICT (id) DO UPDATE SET
    loyalty_points = user_profiles.loyalty_points + points,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Loyalty Points History Table
CREATE TABLE IF NOT EXISTS loyalty_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_history_user ON loyalty_points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_history_order ON loyalty_points_history(order_id);

-- Orders table enhancement - add tracking info columns
DO $$
BEGIN
  -- Add tracking columns to orders if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_status') THEN
    ALTER TABLE orders ADD COLUMN tracking_status TEXT DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_timeline') THEN
    ALTER TABLE orders ADD COLUMN tracking_timeline JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'gift_wrap') THEN
    ALTER TABLE orders ADD COLUMN gift_wrap BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'gift_message') THEN
    ALTER TABLE orders ADD COLUMN gift_message TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'promo_code') THEN
    ALTER TABLE orders ADD COLUMN promo_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount') THEN
    ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- RLS Policies (Row Level Security)
-- Enable RLS on tables
ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points_history ENABLE ROW LEVEL SECURITY;

-- Stock notifications: anyone can insert (for email signup), only admins can view all
CREATE POLICY "Anyone can create stock notifications" ON stock_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own stock notifications" ON stock_notifications
  FOR SELECT USING (email = (SELECT raw_user_meta_data->>'email' FROM auth.users WHERE auth.users.id = auth.uid()));

-- Newsletter: anyone can subscribe
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view newsletter" ON newsletter_subscribers
  FOR SELECT USING (true);

-- Promo codes: public read, admin write
CREATE POLICY "Public can view promo codes" ON promo_codes
  FOR SELECT USING (true);

-- Product questions: auth users can create, anyone can view
CREATE POLICY "Anyone can view questions" ON product_questions
  FOR SELECT USING (true);

CREATE POLICY "Auth users can create questions" ON product_questions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User profiles: users can view own, admins can view all
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Loyalty history: users can view own
CREATE POLICY "Users can view own loyalty history" ON loyalty_points_history
  FOR SELECT USING (user_id = auth.uid());
