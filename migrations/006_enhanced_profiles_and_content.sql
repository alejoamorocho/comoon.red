-- Migration 006: Enhanced profiles and content management
-- Adds rich profile fields for leaders, entrepreneurs, causes and products

-- ============================================================
-- Leaders - Identity, Story, Impact, Location
-- ============================================================
ALTER TABLE leaders ADD COLUMN cover_url TEXT;
ALTER TABLE leaders ADD COLUMN organization_name TEXT;
ALTER TABLE leaders ADD COLUMN who_we_are TEXT;
ALTER TABLE leaders ADD COLUMN our_why TEXT;
ALTER TABLE leaders ADD COLUMN how_to_help TEXT;
ALTER TABLE leaders ADD COLUMN years_active INTEGER;
ALTER TABLE leaders ADD COLUMN impact_scope TEXT;
ALTER TABLE leaders ADD COLUMN community TEXT;
ALTER TABLE leaders ADD COLUMN areas_of_influence JSON;
ALTER TABLE leaders ADD COLUMN people_impacted INTEGER;
ALTER TABLE leaders ADD COLUMN achievements JSON;
ALTER TABLE leaders ADD COLUMN testimonials JSON;
ALTER TABLE leaders ADD COLUMN media_gallery JSON;
ALTER TABLE leaders ADD COLUMN awards JSON;
ALTER TABLE leaders ADD COLUMN email TEXT;
ALTER TABLE leaders ADD COLUMN preferred_contact TEXT;

-- ============================================================
-- Entrepreneurs - Store identity, story, policies
-- ============================================================
ALTER TABLE entrepreneurs ADD COLUMN cover_url TEXT;
ALTER TABLE entrepreneurs ADD COLUMN logo_url TEXT;
ALTER TABLE entrepreneurs ADD COLUMN store_story TEXT;
ALTER TABLE entrepreneurs ADD COLUMN what_makes_special TEXT;
ALTER TABLE entrepreneurs ADD COLUMN social_connection TEXT;
ALTER TABLE entrepreneurs ADD COLUMN years_in_business INTEGER;
ALTER TABLE entrepreneurs ADD COLUMN email TEXT;
ALTER TABLE entrepreneurs ADD COLUMN preferred_contact TEXT;
ALTER TABLE entrepreneurs ADD COLUMN store_policies TEXT;
ALTER TABLE entrepreneurs ADD COLUMN shipping_info TEXT;

-- ============================================================
-- Causes - Enhanced with location, timeline, transparency
-- ============================================================
ALTER TABLE causes ADD COLUMN location TEXT;
ALTER TABLE causes ADD COLUMN beneficiary_count INTEGER;
ALTER TABLE causes ADD COLUMN start_date TEXT;
ALTER TABLE causes ADD COLUMN end_date TEXT;
ALTER TABLE causes ADD COLUMN category TEXT;
ALTER TABLE causes ADD COLUMN needs JSON;
ALTER TABLE causes ADD COLUMN fund_usage TEXT;
ALTER TABLE causes ADD COLUMN impact_metrics JSON;

-- ============================================================
-- Products - Gallery, category, availability
-- ============================================================
ALTER TABLE products ADD COLUMN gallery_photos JSON;
ALTER TABLE products ADD COLUMN category TEXT;
ALTER TABLE products ADD COLUMN availability TEXT DEFAULT 'available';
