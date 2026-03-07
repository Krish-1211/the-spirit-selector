-- ============================================================
-- Company – Supabase SQL Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- STORES
-- ========================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  phone VARCHAR(30),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- PRODUCTS
-- ========================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Whiskey','Wine','Vodka','Beer','Tequila','Rum','Gin','Other')),
  alcohol_percentage NUMERIC(5,2),
  volume_ml INTEGER,
  sku VARCHAR(100) UNIQUE,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  tasting_notes TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- STORE INVENTORY
-- ========================
CREATE TABLE IF NOT EXISTS store_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (store_id, product_id)
);

-- ========================
-- ADMINS
-- ========================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- CUSTOMERS
-- ========================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  date_of_birth DATE,
  is_21_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- ORDER NUMBER SEQUENCE
-- ========================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- ========================
-- ORDERS
-- ========================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number INTEGER UNIQUE DEFAULT nextval('order_number_seq'),
  customer_id UUID REFERENCES customers(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','ready','delivered','cancelled')),
  delivery_type VARCHAR(20) DEFAULT 'pickup' CHECK (delivery_type IN ('pickup','delivery')),
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- ORDER ITEMS
-- ========================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL
);

-- ========================
-- INDEXES
-- ========================
CREATE INDEX IF NOT EXISTS idx_inventory_store ON store_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON store_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ========================
-- SEED: Default Stores
-- ========================
INSERT INTO stores (id, name, address, city, state, zip_code, phone) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Company – Midtown Sacramento', '1234 J Street', 'Sacramento', 'CA', '95814', '(916) 555-0101'),
  ('a1000000-0000-0000-0000-000000000002', 'Company – East Sacramento', '5678 Folsom Blvd', 'Sacramento', 'CA', '95819', '(916) 555-0102'),
  ('a1000000-0000-0000-0000-000000000003', 'Company – San Francisco', '910 Market Street', 'San Francisco', 'CA', '94102', '(415) 555-0103'),
  ('a1000000-0000-0000-0000-000000000004', 'Company – Los Angeles', '1122 Sunset Blvd', 'Los Angeles', 'CA', '90028', '(323) 555-0104')
ON CONFLICT DO NOTHING;

-- ========================
-- SEED: Default Superadmin
-- Password: Admin1234! (bcrypt hash)
-- ========================
INSERT INTO admins (email, password_hash, first_name, last_name, role) VALUES
  ('admin@reservespirits.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8v2q8N0PVjM5u9a6t6O', 'Reserve', 'Admin', 'superadmin')
ON CONFLICT DO NOTHING;
-- ========================
-- SETTINGS
-- ========================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED: Initial Settings
INSERT INTO settings (key, value, description) VALUES
  ('business_name', 'Sure Seal Sealants', 'Company legal name'),
  ('business_email', 'billing@sureseal.com', 'Primary billing email'),
  ('business_address', '123 Sealant Way, Sacramento, CA 95814', 'Company physical address'),
  ('currency', 'USD', 'Default currency code'),
  ('tax_rate', '0.10', 'Global tax rate (0.10 = 10%)'),
  ('invoice_prefix', 'INV-', 'Prefix for generated invoice numbers')
ON CONFLICT (key) DO NOTHING;
