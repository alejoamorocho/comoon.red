-- Seed Data for 'comoon'
-- Note: In production, passwords should be properly hashed (bcrypt/argon2)

-- Users (passwords are hashed versions of: admin123, lider123, emprendedor123, conauta123)
-- These are SHA-256 hashes for demo purposes. Use bcrypt in production!
INSERT INTO users (email, password_hash, role, is_active, is_verified) VALUES
('admin@comoon.co', '$2a$10$demo_admin_hash_placeholder', 'admin', 1, 1),
('elena.marin@email.com', '$2a$10$demo_leader_hash_placeholder', 'leader', 1, 1),
('carlos.rodriguez@email.com', '$2a$10$demo_leader_hash_placeholder', 'leader', 1, 1),
('artesanias@email.com', '$2a$10$demo_entrepreneur_hash', 'entrepreneur', 1, 1),
('cafeorigen@email.com', '$2a$10$demo_entrepreneur_hash', 'entrepreneur', 1, 1),
('conauta@comoon.co', '$2a$10$demo_conauta_hash_placeholder', 'conauta', 1, 1);

-- Leaders
INSERT INTO leaders (user_id, name, bio, location, photo_url, contact_info, social_links, is_verified) VALUES
(2, 'Elena Marin', 'Lider comunitaria con 15 anos de experiencia en Buenaventura. Dedicada a la seguridad alimentaria de los ninos.', 'Buenaventura, Valle del Cauca', 'https://images.unsplash.com/photo-1531123414780-f74242c2b052?q=80&w=1000&auto=format&fit=crop', '{"whatsapp": "+573001234567"}', '{"facebook": "elenacomunidad"}', 1),
(3, 'Carlos Rodriguez', 'Gestor cultural en Quibdo. Cree en la musica como herramienta de transformacion social para jovenes.', 'Quibdo, Choco', 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=1000&auto=format&fit=crop', '{"whatsapp": "+573109876543"}', '{"instagram": "@carlosmusica"}', 1);

-- Update users with profile_id
UPDATE users SET profile_id = 1 WHERE id = 2;
UPDATE users SET profile_id = 2 WHERE id = 3;

-- Causes
INSERT INTO causes (leader_id, title, description, target_goal, status, current_amount, photo_url) VALUES
(1, 'Comedor Comunitario La Esperanza', 'Brindamos almuerzos diarios a 50 ninos del barrio Lleras. Necesitamos fondos para insumos mensuales y reparacion del techo.', 5000000, 'active', 1250000, 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop'),
(2, 'Escuela de Musica del Pacifico', 'Dotacion de instrumentos tradicionales (marimbas, cununos) para 30 jovenes en riesgo de reclutamiento.', 12000000, 'active', 4500000, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1000&auto=format&fit=crop');

-- Entrepreneurs
INSERT INTO entrepreneurs (user_id, store_name, bio, contact_info, location, photo_url, is_verified) VALUES
(4, 'Artesanias del Valle', 'Tienda familiar dedicada a preservar las tecnicas de tejido ancestrales. Usamos fibras naturales y tintes organicos.', '{"whatsapp": "+573151112233", "instagram": "@artesaniasvalle"}', 'Cali, Valle del Cauca', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop', 1),
(5, 'Cafe Origen', 'Cafe de especialidad cultivado en las montanas de Manizales. Comercio justo y apoyo directo a recolectores.', '{"whatsapp": "+573204445566", "website": "cafeorigen.com"}', 'Manizales, Caldas', 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1000&auto=format&fit=crop', 1);

-- Update users with profile_id for entrepreneurs
UPDATE users SET profile_id = 1 WHERE id = 4;
UPDATE users SET profile_id = 2 WHERE id = 5;

-- Products
INSERT INTO products (entrepreneur_id, cause_id, name, price, contribution_text, contribution_amount, contribution_type, photo_url, description, is_active) VALUES
(1, 1, 'Bolso Tejido en Palma', 85000, 'El 15% de esta compra se dona al Comedor La Esperanza.', 15, 'percentage', 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop', 'Bolso artesanal hecho a mano, resistente y con diseno unico.', 1),
(1, 2, 'Sombrero Vueltiao Tradicional', 120000, 'Donamos $20.000 a la Escuela de Musica con cada sombrero.', 20000, 'fixed', 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1000&auto=format&fit=crop', 'Simbolo cultural de Colombia. Tejido fino 19 vueltas.', 1),
(2, 2, 'Cafe de Altura 500g', 35000, 'Apoyamos la cultura: $5.000 van para instrumentos musicales.', 5000, 'fixed', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1000&auto=format&fit=crop', 'Notas de chocolate y caramelo. Tueste medio.', 1),
(2, 1, 'Kit de Degustacion', 60000, 'El 10% apoya la alimentacion de los ninos en Buenaventura.', 10, 'percentage', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop', 'Incluye 3 variedades de cafe especial en presentacion de 120g.', 1);

-- Conautas
INSERT INTO conautas (user_id, name, bio, photo_url, location, interests) VALUES
(6, 'Juan Garcia', 'Apasionado por el cambio social y el consumo responsable. Creo que cada pequena accion cuenta.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', 'Medellin, Antioquia', '["Medio Ambiente", "Educacion", "Cultura"]');

-- Update users with profile_id for conauta
UPDATE users SET profile_id = 1 WHERE id = 6;

-- Sample transactions
INSERT INTO transactions (product_id, cause_id, amount, customer_name, status) VALUES
(1, 1, 12750, 'Cliente Anonimo', 'completed'),
(3, 2, 5000, 'Maria Garcia', 'completed'),
(4, 1, 6000, 'Juan Perez', 'completed');
