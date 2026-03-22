-- Migration 001: Normalize leader tags from JSON column to junction table
-- This replaces the leaders.tags JSON column with a proper many-to-many relationship

-- Create junction table for leader <-> tag assignments
CREATE TABLE IF NOT EXISTS leader_tag_assignments (
  leader_id INTEGER NOT NULL REFERENCES leaders(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES leader_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (leader_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_leader_tag_assignments_leader ON leader_tag_assignments(leader_id);
CREATE INDEX IF NOT EXISTS idx_leader_tag_assignments_tag ON leader_tag_assignments(tag_id);

-- Note: Data migration from leaders.tags JSON to leader_tag_assignments
-- must be run at the application level since D1/SQLite does not support
-- JSON_EACH in all environments. See src/lib/migrations/migrate-tags.ts
