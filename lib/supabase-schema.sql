-- This is a reference schema for Supabase setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  vendor TEXT,
  product_type TEXT,
  data JSONB,
  exported BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Sync status table
CREATE TABLE IF NOT EXISTS sync_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL,
  new_products_count INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Sync schedule table
CREATE TABLE IF NOT EXISTS sync_schedule (
  id TEXT PRIMARY KEY DEFAULT 'default',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  time TEXT NOT NULL,
  days TEXT[] NOT NULL,
  next_run TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_status_created_at ON sync_status(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_sync_schedule_updated_at
BEFORE UPDATE ON sync_schedule
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_schedule ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all data
CREATE POLICY "Allow authenticated users to view products"
ON products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to view logs"
ON logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to view sync_status"
ON sync_status FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to view sync_schedule"
ON sync_schedule FOR SELECT
TO authenticated
USING (true);

-- Allow service role to insert/update data
CREATE POLICY "Allow service role to manage products"
ON products FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role to manage logs"
ON logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role to manage sync_status"
ON sync_status FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role to manage sync_schedule"
ON sync_schedule FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

