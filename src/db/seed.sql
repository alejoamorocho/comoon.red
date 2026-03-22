-- Seed Data for 'comoon'
-- Note: In production, passwords should be properly hashed (bcrypt/argon2)

-- Users (PBKDF2-SHA256 hashes, format: iterations$saltHex$hashHex)
-- Passwords: admin@comoon.co=admin123, all others=cualquier
INSERT INTO users (email, password_hash, role, is_active, is_verified) VALUES
('admin@comoon.co', '100000$d31d28836f64f19394a5c9ec7bb315a1$859ffe0e213210c694344c6b40096a770278ba61211f923d3a89ba9763f77a2f', 'admin', 1, 1),
('elena.marin@email.com', '100000$dca836639e943cd661768561dbd4b5e1$9713531bee9f67618d5c5975d7f209e6301b60815e3fd9cb4d61572ffd82f009', 'leader', 1, 1),
('carlos.rodriguez@email.com', '100000$a142c34f45c02370c7bc2714134d3a3f$2567a8b44b3b8d44af68a93b6a47fbfbd26fd082820a293b077ec17800db9e97', 'leader', 1, 1),
('artesanias@email.com', '100000$49dad959fa56155b3da9c9d1668b3fac$9bbbea527beb72eed8fa194ed854afb85cb83d22494e3ed999a646949be97d21', 'entrepreneur', 1, 1),
('cafeorigen@email.com', '100000$cfed0b353cd72a5ec05939ccafe97acf$5d1ba14004744bcba85deafb41ebb4c78b84c4c3ede55144a6e99be7931e364c', 'entrepreneur', 1, 1);

-- Leaders
INSERT INTO leaders (user_id, name, bio, location, city, department, photo_url, contact_info, social_links, tags, is_verified) VALUES
(2, 'Elena Marin', 'Lider comunitaria con 15 anos de experiencia en Buenaventura. Dedicada a la seguridad alimentaria de los ninos.', 'Buenaventura, Valle del Cauca', 'Buenaventura', 'Valle del Cauca', 'https://images.unsplash.com/photo-1531123414780-f74242c2b052?q=80&w=1000&auto=format&fit=crop', '{"whatsapp": "+573001234567"}', '{"facebook": "elenacomunidad"}', '["alimentacion", "comunidad", "social"]', 1),
(3, 'Carlos Rodriguez', 'Gestor cultural en Quibdo. Cree en la musica como herramienta de transformacion social para jovenes.', 'Quibdo, Choco', 'Quibdo', 'Chocó', 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=1000&auto=format&fit=crop', '{"whatsapp": "+573109876543"}', '{"instagram": "@carlosmusica"}', '["cultura", "educacion", "social"]', 1);

-- Update users with profile_id
UPDATE users SET profile_id = 1 WHERE id = 2;
UPDATE users SET profile_id = 2 WHERE id = 3;

-- Causes
INSERT INTO causes (leader_id, title, description, target_goal, status, current_amount, photo_url) VALUES
(1, 'Comedor Comunitario La Esperanza', 'Brindamos almuerzos diarios a 50 ninos del barrio Lleras. Necesitamos fondos para insumos mensuales y reparacion del techo.', 5000000, 'active', 1250000, 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop'),
(2, 'Escuela de Musica del Pacifico', 'Dotacion de instrumentos tradicionales (marimbas, cununos) para 30 jovenes en riesgo de reclutamiento.', 12000000, 'active', 4500000, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1000&auto=format&fit=crop');

-- Entrepreneurs
INSERT INTO entrepreneurs (user_id, store_name, bio, contact_info, location, city, department, photo_url, is_verified) VALUES
(4, 'Artesanias del Valle', 'Tienda familiar dedicada a preservar las tecnicas de tejido ancestrales. Usamos fibras naturales y tintes organicos.', '{"whatsapp": "+573151112233", "instagram": "@artesaniasvalle"}', 'Cali, Valle del Cauca', 'Cali', 'Valle del Cauca', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop', 1),
(5, 'Cafe Origen', 'Cafe de especialidad cultivado en las montanas de Manizales. Comercio justo y apoyo directo a recolectores.', '{"whatsapp": "+573204445566", "website": "cafeorigen.com"}', 'Manizales, Caldas', 'Manizales', 'Caldas', 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1000&auto=format&fit=crop', 1);

-- Update users with profile_id for entrepreneurs
UPDATE users SET profile_id = 1 WHERE id = 4;
UPDATE users SET profile_id = 2 WHERE id = 5;

-- Products
INSERT INTO products (entrepreneur_id, cause_id, name, price, contribution_text, contribution_amount, contribution_type, photo_url, description, is_active) VALUES
(1, 1, 'Bolso Tejido en Palma', 85000, 'El 15% de esta compra se dona al Comedor La Esperanza.', 15, 'percentage', 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop', 'Bolso artesanal hecho a mano, resistente y con diseno unico.', 1),
(1, 2, 'Sombrero Vueltiao Tradicional', 120000, 'Donamos $20.000 a la Escuela de Musica con cada sombrero.', 20000, 'fixed', 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1000&auto=format&fit=crop', 'Simbolo cultural de Colombia. Tejido fino 19 vueltas.', 1),
(2, 2, 'Cafe de Altura 500g', 35000, 'Apoyamos la cultura: $5.000 van para instrumentos musicales.', 5000, 'fixed', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1000&auto=format&fit=crop', 'Notas de chocolate y caramelo. Tueste medio.', 1),
(2, 1, 'Kit de Degustacion', 60000, 'El 10% apoya la alimentacion de los ninos en Buenaventura.', 10, 'percentage', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop', 'Incluye 3 variedades de cafe especial en presentacion de 120g.', 1);

-- Sample transactions
INSERT INTO transactions (product_id, cause_id, amount, customer_name, status) VALUES
(1, 1, 12750, 'Cliente Anonimo', 'completed'),
(3, 2, 5000, 'Maria Garcia', 'completed'),
(4, 1, 6000, 'Juan Perez', 'completed');

-- Cause Updates (progress updates for causes by leaders)
INSERT INTO cause_updates (leader_id, cause_id, title, content, photo_url, update_type, is_closing, created_at) VALUES
(1, 1, 'Llegamos al 25% de nuestra meta!', 'Gracias a todos los que han comprado productos que apoyan nuestro comedor. Hoy servimos almuerzo a 50 ninos y sus familias estan muy agradecidas. Seguimos adelante con la reparacion del techo.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop', 'milestone', 0, datetime('now', '-5 days')),
(1, 1, 'Gracias a Artesanias del Valle', 'Queremos agradecer especialmente a Artesanias del Valle por unirse a nuestra causa. Sus bolsos tejidos han sido un exito y cada compra nos acerca mas a nuestra meta.', NULL, 'gratitude', 0, datetime('now', '-3 days')),
(2, 2, 'Nuevos instrumentos para la escuela', 'Esta semana recibimos 5 cununos nuevos gracias a las donaciones. Los jovenes estan emocionados aprendiendo los ritmos tradicionales del Pacifico.', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop', 'progress', 0, datetime('now', '-2 days')),
(2, 2, 'Primer concierto de nuestros estudiantes', 'El sabado pasado realizamos el primer concierto de la escuela. 30 jovenes mostraron su talento ante 200 personas de la comunidad. Fue un dia inolvidable.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1000&auto=format&fit=crop', 'milestone', 0, datetime('now', '-1 day')),
(1, 1, 'Jornada de limpieza comunitaria', 'Hoy organizamos una jornada de limpieza con los ninos del comedor. Recogimos 50 bolsas de basura y pintamos murales en las paredes. La comunidad unida es mas fuerte!', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1000&auto=format&fit=crop', 'progress', 0, datetime('now'));
