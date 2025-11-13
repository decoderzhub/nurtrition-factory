/*
  # Create Storage Buckets for Images

  ## Overview
  Creates Supabase Storage buckets for product images, blog images, and smoothie images.
  Sets up proper access policies for public read and admin write.

  ## Buckets
  1. product-images - For product photos
  2. blog-images - For blog post featured images and content images
  3. smoothie-images - For smoothie menu item photos

  ## Security
  - Public read access for all buckets (anyone can view images)
  - Only authenticated admin users can upload, update, or delete images
  - File size limits and type restrictions applied
*/

-- Insert storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('smoothie-images', 'smoothie-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images bucket

-- Allow public to view/download images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' 
    AND is_admin()
  );

-- Allow admins to update images
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images' 
    AND is_admin()
  )
  WITH CHECK (
    bucket_id = 'product-images' 
    AND is_admin()
  );

-- Allow admins to delete images
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' 
    AND is_admin()
  );

-- Storage policies for blog-images bucket

CREATE POLICY "Public can view blog images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images' 
    AND is_admin()
  );

CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog-images' 
    AND is_admin()
  )
  WITH CHECK (
    bucket_id = 'blog-images' 
    AND is_admin()
  );

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-images' 
    AND is_admin()
  );

-- Storage policies for smoothie-images bucket

CREATE POLICY "Public can view smoothie images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'smoothie-images');

CREATE POLICY "Admins can upload smoothie images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'smoothie-images' 
    AND is_admin()
  );

CREATE POLICY "Admins can update smoothie images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'smoothie-images' 
    AND is_admin()
  )
  WITH CHECK (
    bucket_id = 'smoothie-images' 
    AND is_admin()
  );

CREATE POLICY "Admins can delete smoothie images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'smoothie-images' 
    AND is_admin()
  );
