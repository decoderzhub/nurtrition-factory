/*
  # Stripe Integration Schema

  ## New Tables
  
  1. **discount_codes**
    - `id` (uuid, primary key)
    - `code` (text, unique) - The discount code customers enter
    - `stripe_coupon_id` (text, nullable) - Reference to Stripe coupon
    - `discount_type` (text) - 'percentage' or 'fixed_amount'
    - `discount_value` (numeric) - Percentage or amount off
    - `duration` (text) - 'once', 'repeating', 'forever'
    - `duration_in_months` (integer, nullable) - For repeating coupons
    - `is_active` (boolean, default true)
    - `max_redemptions` (integer, nullable) - Max number of uses
    - `redemptions_count` (integer, default 0) - Current use count
    - `expires_at` (timestamptz, nullable) - Expiration date
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  2. **stripe_subscriptions**
    - `id` (uuid, primary key)
    - `user_id` (uuid, references user_profiles)
    - `stripe_subscription_id` (text, unique) - Stripe subscription ID
    - `stripe_customer_id` (text) - Stripe customer ID
    - `product_id` (uuid, references products)
    - `status` (text) - 'active', 'canceled', 'past_due', 'unpaid'
    - `current_period_start` (timestamptz)
    - `current_period_end` (timestamptz)
    - `cancel_at_period_end` (boolean, default false)
    - `canceled_at` (timestamptz, nullable)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Column Additions

  ### products table
  - `stripe_product_id` (text, nullable, unique) - Stripe product ID
  - `stripe_price_id` (text, nullable) - Stripe price ID for one-time
  - `stripe_sync_status` (text, default 'not_synced') - Sync status
  - `stripe_sync_error` (text, nullable) - Last sync error message
  - `stripe_last_synced_at` (timestamptz, nullable) - Last sync timestamp
  - `is_subscription` (boolean, default false) - Is this a subscription product
  - `subscription_interval` (text, nullable) - 'day', 'week', 'month', 'year'
  - `subscription_interval_count` (integer, default 1) - Billing frequency

  ### user_profiles table
  - `stripe_customer_id` (text, nullable, unique) - Stripe customer ID

  ### orders table
  - `discount_code_id` (uuid, nullable, references discount_codes)
  - `discount_amount` (numeric, default 0) - Amount discounted

  ## Security
  - Enable RLS on all new tables
  - Add policies for authenticated users
  - Add admin-only policies for management

  ## Notes
  - Stripe sync is manual, triggered by admin
  - Supports both one-time and subscription products
  - Discount codes sync with Stripe coupons
*/

-- Add Stripe-related columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_product_id text UNIQUE;
    ALTER TABLE products ADD COLUMN stripe_price_id text;
    ALTER TABLE products ADD COLUMN stripe_sync_status text DEFAULT 'not_synced' CHECK (stripe_sync_status IN ('not_synced', 'syncing', 'synced', 'error'));
    ALTER TABLE products ADD COLUMN stripe_sync_error text;
    ALTER TABLE products ADD COLUMN stripe_last_synced_at timestamptz;
    ALTER TABLE products ADD COLUMN is_subscription boolean DEFAULT false;
    ALTER TABLE products ADD COLUMN subscription_interval text CHECK (subscription_interval IN ('day', 'week', 'month', 'year'));
    ALTER TABLE products ADD COLUMN subscription_interval_count integer DEFAULT 1;
  END IF;
END $$;

-- Add Stripe customer ID to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN stripe_customer_id text UNIQUE;
  END IF;
END $$;

-- Add discount columns to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount_code_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_code_id uuid;
    ALTER TABLE orders ADD COLUMN discount_amount numeric DEFAULT 0;
  END IF;
END $$;

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  stripe_coupon_id text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  duration text NOT NULL CHECK (duration IN ('once', 'repeating', 'forever')),
  duration_in_months integer,
  is_active boolean DEFAULT true,
  max_redemptions integer,
  redemptions_count integer DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to orders.discount_code_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_discount_code_id_fkey'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_discount_code_id_fkey 
      FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for discount_codes

-- Public can view active discount codes (for validation)
CREATE POLICY "Anyone can view active discount codes"
  ON discount_codes FOR SELECT
  TO public
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Admins can manage all discount codes
CREATE POLICY "Admins can insert discount codes"
  ON discount_codes FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update discount codes"
  ON discount_codes FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete discount codes"
  ON discount_codes FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can view all discount codes"
  ON discount_codes FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policies for stripe_subscriptions

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (is_admin());

-- Only the system can create/update subscriptions (via Edge Functions)
CREATE POLICY "Admins can insert subscriptions"
  ON stripe_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update subscriptions"
  ON stripe_subscriptions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_stripe_id ON stripe_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_products_stripe_sync_status ON products(stripe_sync_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);