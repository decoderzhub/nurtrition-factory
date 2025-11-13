/*
  # Nutrition Factory E-Commerce Database Schema

  ## Overview
  Complete database schema for Nutrition Factory LLC e-commerce platform including products, 
  categories, blog posts, reviews, smoothie bar menu, and contact submissions.

  ## New Tables

  ### 1. categories
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name (e.g., "Energy Drinks", "Supplements")
  - `slug` (text, unique) - URL-friendly version of name
  - `description` (text) - Category description
  - `image_url` (text) - Category image
  - `display_order` (integer) - Order for displaying categories
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. products
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `slug` (text, unique) - URL-friendly version of name
  - `description` (text) - Product description
  - `price` (decimal) - Product price
  - `image_url` (text) - Main product image
  - `category_id` (uuid, foreign key) - Reference to categories
  - `is_featured` (boolean) - Featured on home page
  - `is_top_selling` (boolean) - Top selling product
  - `stock_quantity` (integer) - Available stock
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. blog_posts
  - `id` (uuid, primary key) - Unique post identifier
  - `title` (text) - Post title
  - `slug` (text, unique) - URL-friendly version of title
  - `content` (text) - Post content
  - `excerpt` (text) - Short excerpt for listings
  - `image_url` (text) - Featured image
  - `author` (text) - Post author name
  - `published_at` (timestamptz) - Publication date
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. reviews
  - `id` (uuid, primary key) - Unique review identifier
  - `product_id` (uuid, foreign key, nullable) - Reference to products (optional)
  - `author_name` (text) - Reviewer name
  - `rating` (integer) - Rating 1-5
  - `comment` (text) - Review text
  - `is_approved` (boolean) - Moderation flag
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. smoothie_menu_items
  - `id` (uuid, primary key) - Unique menu item identifier
  - `name` (text) - Smoothie name
  - `description` (text) - Smoothie description
  - `price` (decimal) - Smoothie price
  - `ingredients` (text) - List of ingredients
  - `image_url` (text) - Smoothie image
  - `is_available` (boolean) - Availability status
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. contact_submissions
  - `id` (uuid, primary key) - Unique submission identifier
  - `name` (text) - Contact name
  - `email` (text) - Contact email
  - `phone` (text, nullable) - Contact phone
  - `message` (text) - Message content
  - `submission_type` (text) - Type: 'contact', 'smoothie_preorder'
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public read access for products, categories, blog posts, approved reviews, and smoothie menu
  - No public write access (admin-only via service role)

  ## Notes
  - All tables use UUID primary keys for scalability
  - Timestamps use timestamptz for timezone awareness
  - Slugs are unique for SEO-friendly URLs
  - Products support featured and top-selling flags for homepage sections
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price decimal(10, 2) NOT NULL,
  image_url text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_featured boolean DEFAULT false,
  is_top_selling boolean DEFAULT false,
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text DEFAULT '',
  image_url text DEFAULT '',
  author text DEFAULT 'Nutrition Factory Team',
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create smoothie_menu_items table
CREATE TABLE IF NOT EXISTS smoothie_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10, 2) NOT NULL,
  ingredients text DEFAULT '',
  image_url text DEFAULT '',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  message text NOT NULL,
  submission_type text DEFAULT 'contact',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE smoothie_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for products (public read)
CREATE POLICY "Public can view products"
  ON products FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for blog_posts (public read)
CREATE POLICY "Public can view blog posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for reviews (public read approved only)
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  TO anon
  USING (is_approved = true);

-- RLS Policies for smoothie_menu_items (public read available only)
CREATE POLICY "Public can view available smoothie items"
  ON smoothie_menu_items FOR SELECT
  TO anon
  USING (is_available = true);

-- RLS Policies for contact_submissions (public insert only)
CREATE POLICY "Public can submit contact forms"
  ON contact_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_top_selling ON products(is_top_selling) WHERE is_top_selling = true;
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;