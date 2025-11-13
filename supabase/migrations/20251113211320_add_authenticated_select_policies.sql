/*
  # Add SELECT policies for authenticated users
  
  1. Changes
    - Add SELECT policy for authenticated users on products table
    - Add SELECT policy for authenticated users on categories table
    - Add SELECT policy for authenticated users on other public tables
  
  2. Security
    - Allows authenticated users (including admins) to view all public data
    - Maintains existing policies for anonymous users
*/

-- Products: Allow authenticated users to view all products
CREATE POLICY "Authenticated users can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Categories: Allow authenticated users to view all categories
CREATE POLICY "Authenticated users can view categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Reviews: Policy already exists for approved reviews, but add one for all reviews for authenticated
-- (The existing approved-only policy will still work for anon users)

-- Smoothie menu: Policy already exists

-- Blog posts: Policy already exists