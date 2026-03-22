-- Migration 002: Add constraints and indexes
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS checks)

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_causes_status ON causes(status);
CREATE INDEX IF NOT EXISTS idx_leaders_city ON leaders(city);

-- Note: NOT NULL and ON DELETE CASCADE constraints require table recreation in SQLite.
-- These are enforced at the application/repository layer instead.
-- See src/lib/repositories/ for validation logic.
