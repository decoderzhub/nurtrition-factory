/*
  # Add Admin Policies and Helper Functions

  ## Overview
  Adds admin-only RLS policies for managing products, blog posts, smoothies, and other content.
  Creates helper function for checking admin status.

  ## Changes
  1. Create is_admin() helper function if not exists
  2. Add admin INSERT, UPDATE, DELETE policies for all content tables
  3. Ensure proper security for admin operations

  ## Security
  - Only users with role='admin' in user_profiles can perform admin operations
  - Regular users and anonymous users cannot modify content
*/

-- Create helper function to check if user is admin (idempotent)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing admin policies if they exist to avoid conflicts
DO $$
BEGIN
  -- Products policies
  DROP POLICY IF EXISTS "Admins can insert products" ON products;
  DROP POLICY IF EXISTS "Admins can update products" ON products;
  DROP POLICY IF EXISTS "Admins can delete products" ON products;
  
  -- Categories policies
  DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
  DROP POLICY IF EXISTS "Admins can update categories" ON categories;
  DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
  
  -- Blog posts policies
  DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;
  DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
  DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;
  
  -- Smoothie menu policies
  DROP POLICY IF EXISTS "Admins can insert smoothie items" ON smoothie_menu_items;
  DROP POLICY IF EXISTS "Admins can update smoothie items" ON smoothie_menu_items;
  DROP POLICY IF EXISTS "Admins can delete smoothie items" ON smoothie_menu_items;
  
  -- Reviews policies
  DROP POLICY IF EXISTS "Admins can update reviews" ON reviews;
  DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;
  DROP POLICY IF EXISTS "Admins can insert reviews" ON reviews;
  DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
  
  -- Contact submissions policies
  DROP POLICY IF EXISTS "Admins can view all contact submissions" ON contact_submissions;
  DROP POLICY IF EXISTS "Admins can delete contact submissions" ON contact_submissions;
  DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
  
  -- Orders policies
  DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
  DROP POLICY IF EXISTS "Admins can update orders" ON orders;
  DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
  DROP POLICY IF EXISTS "Users can view own orders" ON orders;
  DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
  DROP POLICY IF EXISTS "Guests can create orders" ON orders;
  
  -- Order items policies
  DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
  DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
  DROP POLICY IF EXISTS "Authenticated users can insert order items" ON order_items;
  DROP POLICY IF EXISTS "Guests can insert order items" ON order_items;
END $$;

-- Products admin policies
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin());

-- Categories admin policies
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (is_admin());

-- Blog posts admin policies
CREATE POLICY "Admins can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (is_admin());

-- Smoothie menu admin policies
CREATE POLICY "Admins can insert smoothie items"
  ON smoothie_menu_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update smoothie items"
  ON smoothie_menu_items FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete smoothie items"
  ON smoothie_menu_items FOR DELETE
  TO authenticated
  USING (is_admin());

-- Reviews admin policies
CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (is_admin());

-- Contact submissions admin policies
CREATE POLICY "Admins can view all contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  TO authenticated
  USING (is_admin());

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Guests can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (is_admin());

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Authenticated users can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Guests can insert order items"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id IS NULL
    )
  );
