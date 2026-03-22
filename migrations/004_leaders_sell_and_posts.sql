-- Migration 004: Leaders can sell products + Free posts
-- Leaders can now have their own products (without entrepreneur)
-- Posts table for free-form text+photo publications

-- Products can now belong to a leader (without entrepreneur)
ALTER TABLE products ADD COLUMN leader_id INTEGER REFERENCES leaders(id);
CREATE INDEX IF NOT EXISTS idx_products_leader_id ON products(leader_id);

-- Posts: free-form publications from any role
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
