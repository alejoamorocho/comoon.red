-- Migration 008: Add share count to causes for tracking popularity
ALTER TABLE causes ADD COLUMN share_count INTEGER DEFAULT 0;
