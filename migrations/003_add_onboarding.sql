-- Add onboarding tracking columns to users table
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN onboarded_at TEXT;
