-- Migration 007: Cause objectives for tracking progress
CREATE TABLE IF NOT EXISTS cause_objectives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cause_id INTEGER NOT NULL REFERENCES causes(id),
    title TEXT NOT NULL,
    description TEXT,
    target_value REAL,
    current_value REAL DEFAULT 0,
    unit TEXT DEFAULT '',
    is_completed BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
