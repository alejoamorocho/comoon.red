-- Database Schema for 'comoon'
-- Cloudflare D1 (SQLite compatible)

DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS causes;
DROP TABLE IF EXISTS entrepreneurs;
DROP TABLE IF EXISTS leaders;
DROP TABLE IF EXISTS users;

-- Users table for authentication
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'leader', 'entrepreneur', 'conauta')),
  profile_id INTEGER, -- References leaders.id, entrepreneurs.id or conautas.id based on role
  is_active BOOLEAN DEFAULT 1,
  is_verified BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaders table
CREATE TABLE leaders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
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
CREATE TABLE leader_tags (
  id TEXT PRIMARY KEY, -- slug: ambiental, social, animales, etc.
  name TEXT NOT NULL,
  color TEXT NOT NULL, -- emerald, blue, orange, etc.
  icon TEXT NOT NULL, -- Leaf, UsersThree, PawPrint, etc.
  description TEXT
);

-- Causes (Social Causes) table
CREATE TABLE causes (
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
CREATE TABLE entrepreneurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  store_name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  photo_url TEXT,
  contact_info JSON, -- { whatsapp, instagram, website, etc. }
  is_verified BOOLEAN DEFAULT 0,
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entrepreneur_id INTEGER NOT NULL,
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
  FOREIGN KEY (cause_id) REFERENCES causes(id)
);

-- Conautas table (users who want to help without being leaders or entrepreneurs)
CREATE TABLE conautas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  location TEXT,
  interests JSON, -- Array of interest tags
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Orders/Transactions table (for tracking contributions)
CREATE TABLE transactions (
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_leaders_user_id ON leaders(user_id);
CREATE INDEX idx_entrepreneurs_user_id ON entrepreneurs(user_id);
CREATE INDEX idx_causes_leader_id ON causes(leader_id);
CREATE INDEX idx_causes_status ON causes(status);
CREATE INDEX idx_products_entrepreneur_id ON products(entrepreneur_id);
CREATE INDEX idx_products_cause_id ON products(cause_id);
CREATE INDEX idx_transactions_cause_id ON transactions(cause_id);
CREATE INDEX idx_conautas_user_id ON conautas(user_id);

-- Seed leader tags
INSERT INTO leader_tags (id, name, color, icon, description) VALUES
('ambiental', 'Ambiental', 'emerald', 'Leaf', 'Causas relacionadas con medio ambiente y ecologia'),
('social', 'Social', 'blue', 'UsersThree', 'Causas de bienestar comunitario y derechos humanos'),
('animales', 'Animales', 'orange', 'PawPrint', 'Proteccion y bienestar animal'),
('educacion', 'Educacion', 'purple', 'BookOpen', 'Acceso a educacion y formacion'),
('salud', 'Salud', 'red', 'FirstAid', 'Salud comunitaria y acceso a servicios medicos'),
('cultura', 'Cultura', 'pink', 'Palette', 'Preservacion cultural y artes'),
('comunidad', 'Comunidad', 'cyan', 'House', 'Desarrollo comunitario y vivienda'),
('alimentacion', 'Alimentacion', 'yellow', 'ForkKnife', 'Seguridad alimentaria y nutricion');
