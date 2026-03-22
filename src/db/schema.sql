-- Database Schema for 'comoon'
-- Cloudflare D1 (SQLite compatible)
-- NOTE: Use migrations/ for incremental changes. This file is the canonical
-- reference schema. Never use DROP TABLE in production migrations.

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'leader', 'entrepreneur')),
  profile_id INTEGER, -- References leaders.id or entrepreneurs.id based on role
  is_active BOOLEAN DEFAULT 1,
  is_verified BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaders table
CREATE TABLE IF NOT EXISTS leaders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  city TEXT,
  department TEXT,
  photo_url TEXT,
  contact_info JSON, -- { whatsapp, instagram, facebook, etc. }
  social_links JSON,
  tags JSON, -- Array of tag IDs: ["ambiental", "social", "educacion"]
  is_verified BOOLEAN DEFAULT 0,
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Leader Tags reference table (for available tags)
CREATE TABLE IF NOT EXISTS leader_tags (
  id TEXT PRIMARY KEY, -- slug: ambiental, social, animales, etc.
  name TEXT NOT NULL,
  color TEXT NOT NULL, -- emerald, blue, orange, etc.
  icon TEXT NOT NULL, -- Leaf, UsersThree, PawPrint, etc.
  description TEXT
);

-- Causes (Social Causes) table
CREATE TABLE IF NOT EXISTS causes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leader_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_goal REAL,
  current_amount REAL DEFAULT 0,
  photo_url TEXT,
  evidence_photos JSON, -- Array of photo URLs
  status TEXT DEFAULT 'active' CHECK(status IN ('pending', 'active', 'completed', 'archived', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES leaders(id)
);

-- Entrepreneurs table
CREATE TABLE IF NOT EXISTS entrepreneurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  store_name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  city TEXT,
  department TEXT,
  photo_url TEXT,
  contact_info JSON, -- { whatsapp, instagram, website, etc. }
  is_verified BOOLEAN DEFAULT 0,
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Posts table (free-form publications)
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entrepreneur_id INTEGER,
  leader_id INTEGER,
  cause_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  contribution_text TEXT, -- e.g., "Donamos el 10% de cada venta"
  contribution_amount REAL, -- Fixed amount or percentage
  contribution_type TEXT DEFAULT 'percentage' CHECK(contribution_type IN ('percentage', 'fixed')),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entrepreneur_id) REFERENCES entrepreneurs(id),
  FOREIGN KEY (leader_id) REFERENCES leaders(id),
  FOREIGN KEY (cause_id) REFERENCES causes(id)
);

-- Cause Updates table (progress updates for causes by leaders)
CREATE TABLE IF NOT EXISTS cause_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leader_id INTEGER NOT NULL,
  cause_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  photos JSON, -- Array of additional photo URLs
  update_type TEXT DEFAULT 'progress' CHECK(update_type IN ('progress', 'milestone', 'gratitude', 'closing')),
  is_closing BOOLEAN DEFAULT 0, -- If true, this update closes the cause
  amount_reported REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES leaders(id),
  FOREIGN KEY (cause_id) REFERENCES causes(id)
);

-- Orders/Transactions table (for tracking contributions)
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  cause_id INTEGER NOT NULL,
  amount REAL NOT NULL, -- Contribution amount
  customer_name TEXT,
  customer_contact TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (cause_id) REFERENCES causes(id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_leaders_user_id ON leaders(user_id);
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_user_id ON entrepreneurs(user_id);
CREATE INDEX IF NOT EXISTS idx_causes_leader_id ON causes(leader_id);
CREATE INDEX IF NOT EXISTS idx_causes_status ON causes(status);
CREATE INDEX IF NOT EXISTS idx_products_entrepreneur_id ON products(entrepreneur_id);
CREATE INDEX IF NOT EXISTS idx_products_cause_id ON products(cause_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cause_id ON transactions(cause_id);
CREATE INDEX IF NOT EXISTS idx_cause_updates_leader_id ON cause_updates(leader_id);
CREATE INDEX IF NOT EXISTS idx_cause_updates_cause_id ON cause_updates(cause_id);
CREATE INDEX IF NOT EXISTS idx_cause_updates_created_at ON cause_updates(created_at);
CREATE INDEX IF NOT EXISTS idx_leaders_department ON leaders(department);
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_department ON entrepreneurs(department);
CREATE INDEX IF NOT EXISTS idx_products_leader_id ON products(leader_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- Seed leader tags
INSERT OR IGNORE INTO leader_tags (id, name, color, icon, description) VALUES
('ambiental', 'Ambiental', 'emerald', 'Leaf', 'Causas relacionadas con medio ambiente y ecologia'),
('social', 'Social', 'blue', 'UsersThree', 'Causas de bienestar comunitario y derechos humanos'),
('animales', 'Animales', 'orange', 'PawPrint', 'Proteccion y bienestar animal'),
('educacion', 'Educacion', 'purple', 'BookOpen', 'Acceso a educacion y formacion'),
('salud', 'Salud', 'red', 'FirstAid', 'Salud comunitaria y acceso a servicios medicos'),
('cultura', 'Cultura', 'pink', 'Palette', 'Preservacion cultural y artes'),
('comunidad', 'Comunidad', 'cyan', 'House', 'Desarrollo comunitario y vivienda'),
('alimentacion', 'Alimentacion', 'yellow', 'ForkKnife', 'Seguridad alimentaria y nutricion');
