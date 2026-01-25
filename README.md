# comoon

> Cada compra ilumina una causa.

**comoon** es una plataforma de comercio social que conecta **Lideres Sociales** que necesitan recursos para sus causas con **Emprendedores** que quieren vender con proposito. Cada producto vendido genera una donacion directa a una causa social verificada.

---

## Tabla de Contenidos

- [Vision General](#vision-general)
- [Logica de Negocio](#logica-de-negocio)
- [Stack Tecnologico](#stack-tecnologico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalacion](#instalacion)
- [Configuracion](#configuracion)
- [Rutas y Paginas](#rutas-y-paginas)
- [Componentes](#componentes)
- [Base de Datos](#base-de-datos)
- [API](#api)
- [Despliegue](#despliegue)
- [Credenciales de Prueba](#credenciales-de-prueba)

---

## Vision General

### El Proposito

comoon nace de una realidad colombiana critica: los lideres sociales necesitan visibilidad para proteger sus vidas y recursos para sus causas. El proyecto une este proposito con el emprendimiento responsable.

**Mision:** Humanizar el trabajo del lider y financiar causas sociales a traves de productos comerciales.

**Filosofia:** "Cada compra ilumina una causa."

### Actores del Ecosistema

| Actor | Descripcion |
|-------|-------------|
| **Lider Social** | Centro del ecosistema. Crea perfil con biografia, zona de influencia y causas que lidera. Es el rostro de la causa. |
| **Causa** | Objetivo especifico (ej. "Comedor comunitario en Buenaventura"). Solo puede ser creada por un lider validado. |
| **Emprendedor** | Crea perfil de tienda y catalogo de productos. |
| **Usuario/Promotor** | Navega, filtra por ubicacion/causa y comparte perfiles con "Difusion Lunar". |

---

## Logica de Negocio

### La Alianza (Core Logic)

Para que un producto sea visible en la plataforma, **debe estar vinculado obligatoriamente a una causa activa**. El emprendedor especifica el impacto: "Con la compra de este producto, donamos $X a la causa Y".

### Flujo de Conversion

```
1. Usuario navega la tienda
2. Ve productos con impacto social visible
3. Click en "Conectar por WhatsApp"
4. Se abre WhatsApp con mensaje automatico:
   "Hola, me interesa el producto [Nombre] y quiero apoyar la causa de [Lider] via comoon"
5. Emprendedor recibe contacto directo
6. Venta se realiza fuera de la plataforma
7. Donacion va a la causa del lider
```

### Reglas de Negocio

- **No hay carrito de compras** - La accion principal es "Conectar por WhatsApp"
- **Producto sin causa = No visible** - Todo producto debe apoyar una causa
- **Lider verificado** - Solo lideres verificados pueden crear causas
- **Transparencia** - Progreso de recaudacion visible en cada causa

---

## Stack Tecnologico

| Tecnologia | Uso |
|------------|-----|
| **Astro 5.x** | Framework SSR (Server-Side Rendering) |
| **React 19** | Componentes interactivos |
| **TypeScript** | Tipado estatico |
| **Tailwind CSS** | Estilos con tema Dracula |
| **Hono.js** | API REST en Cloudflare Workers |
| **Cloudflare D1** | Base de datos SQLite en el edge |
| **Cloudflare R2** | Almacenamiento de imagenes |
| **Phosphor Icons** | Iconografia (variante Duotone) |

### Fuentes

- **Inter** - Tipografia principal (sans-serif)
- **JetBrains Mono** - Tipografia monospace

---

## Estructura del Proyecto

```
comoon/
├── public/
│   ├── favicon.svg          # Logo de luna comoon
│   └── icon.svg              # Icono transparente
├── src/
│   ├── api/                  # Backend Hono.js
│   │   ├── index.ts          # App principal
│   │   ├── leaders.ts        # Rutas de lideres
│   │   └── products.ts       # Rutas de productos
│   ├── components/           # Componentes reutilizables
│   │   ├── Navbar.tsx        # Navegacion con logo
│   │   ├── RegisterForm.tsx  # Registro con contrasena
│   │   ├── LoginForm.tsx     # Inicio de sesion
│   │   ├── ProductCard.astro # Tarjeta de producto
│   │   ├── LeaderCard.astro  # Tarjeta de lider
│   │   ├── WhatsAppButton.tsx # Boton de contacto
│   │   ├── ShareButtons.tsx  # Difusion Lunar
│   │   ├── StoreFilters.tsx  # Filtros de tienda
│   │   └── SearchHero.tsx    # Buscador hero
│   ├── data/
│   │   └── colombia.json     # Departamentos y ciudades
│   ├── db/
│   │   ├── schema.sql        # Esquema de base de datos
│   │   └── seed.sql          # Datos de ejemplo
│   ├── layouts/
│   │   └── Layout.astro      # Layout principal
│   ├── pages/                # Rutas (file-based routing)
│   │   ├── index.astro       # Home
│   │   ├── login/
│   │   │   └── index.astro   # Inicio de sesion
│   │   ├── register/
│   │   │   └── index.astro   # Registro
│   │   ├── leaders/
│   │   │   ├── index.astro   # Listado de lideres
│   │   │   └── [id].astro    # Perfil de lider
│   │   ├── entrepreneurs/
│   │   │   ├── index.astro   # Listado de emprendedores
│   │   │   └── [id].astro    # Perfil de emprendedor
│   │   ├── store/
│   │   │   ├── index.astro   # Tienda con filtros
│   │   │   └── [id].astro    # Detalle de producto
│   │   ├── causes/
│   │   │   └── [id].astro    # Detalle de causa
│   │   ├── dashboard/
│   │   │   ├── leader.astro      # Panel de lider
│   │   │   ├── entrepreneur.astro # Panel de emprendedor
│   │   │   └── admin.astro       # Panel de admin
│   │   └── api/
│   │       └── [...path].ts  # Proxy para Hono
│   └── styles/
│       └── global.css        # Estilos globales + Dracula
├── astro.config.mjs          # Configuracion Astro
├── tailwind.config.mjs       # Configuracion Tailwind
├── wrangler.toml             # Configuracion Cloudflare
├── package.json
└── tsconfig.json
```

---

## Instalacion

### Requisitos Previos

- Node.js 18+
- npm o pnpm
- Cuenta de Cloudflare (para D1 y despliegue)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/alejoamorocho/comoon.red.git
cd comoon.red

# 2. Instalar dependencias
npm install

# 3. Ejecutar en desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:4321
```

---

## Configuracion

### Variables de Entorno

Crear archivo `.env` (no incluido en el repo):

```env
# Cloudflare
CF_ACCOUNT_ID=tu_account_id
CF_API_TOKEN=tu_api_token

# D1 Database
D1_DATABASE_ID=tu_database_id
```

### Configuracion de Cloudflare D1

```bash
# 1. Instalar Wrangler CLI
npm install -g wrangler

# 2. Autenticarse
wrangler login

# 3. Crear base de datos D1
wrangler d1 create comoon-db

# 4. Actualizar wrangler.toml con el database_id

# 5. Ejecutar migraciones
wrangler d1 execute comoon-db --file=./src/db/schema.sql

# 6. Cargar datos de ejemplo
wrangler d1 execute comoon-db --file=./src/db/seed.sql
```

### Configuracion de Cloudflare R2 (Imagenes)

```bash
# 1. Crear bucket R2
wrangler r2 bucket create comoon-images

# 2. Agregar binding en wrangler.toml
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "comoon-images"
```

---

## Rutas y Paginas

### Paginas Publicas

| Ruta | Descripcion |
|------|-------------|
| `/` | Home - Hero, seccion de roles, CTA |
| `/leaders` | Listado de lideres sociales verificados |
| `/leaders/:id` | Perfil de lider con causa y productos |
| `/entrepreneurs` | Listado de emprendedores/tiendas |
| `/entrepreneurs/:id` | Perfil de tienda con productos |
| `/store` | Tienda general con filtros |
| `/store?causa=:id` | Productos filtrados por causa |
| `/store?lider=:id` | Productos filtrados por lider |
| `/store/:id` | Detalle de producto |
| `/causes/:id` | Detalle de causa con progreso |

### Autenticacion

| Ruta | Descripcion |
|------|-------------|
| `/register` | Registro de lider o emprendedor |
| `/login` | Inicio de sesion |

### Dashboards (Requieren autenticacion)

| Ruta | Rol | Descripcion |
|------|-----|-------------|
| `/dashboard/leader` | Lider | Crear causas, ver estadisticas, emprendedores aliados |
| `/dashboard/entrepreneur` | Emprendedor | Crear productos, vincular causas, ver ventas |
| `/dashboard/admin` | Admin | Gestionar usuarios, aprobar lideres, revisar causas |

---

## Componentes

### Navbar.tsx

Barra de navegacion principal con:
- Logo SVG de comoon (luna)
- Enlaces: Inicio, Lideres, Emprendedores, Tienda
- Botones: Ingresar, Unete

### WhatsAppButton.tsx

Boton de accion principal. Props:
- `productName`: Nombre del producto
- `leaderName`: Nombre del lider de la causa
- `entrepreneurPhone`: Telefono del emprendedor (opcional)

Genera mensaje: "Hola, me interesa el producto [X] y quiero apoyar la causa de [Y] via comoon"

### ShareButtons.tsx (Difusion Lunar)

Botones para compartir en redes:
- WhatsApp
- Facebook
- Twitter/X
- Copiar enlace

### StoreFilters.tsx

Filtros interactivos para la tienda:
- Filtrar por Causa
- Filtrar por Lider
- Limpiar filtros

### ProductCard.astro

Tarjeta de producto con:
- Imagen con precio
- Nombre y emprendedor
- Seccion "Impacto Directo" con causa vinculada
- Boton WhatsApp integrado

---

## Base de Datos

### Esquema (D1/SQLite)

```sql
-- Usuarios para autenticacion
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'leader', 'entrepreneur')),
  profile_id INTEGER,
  is_active BOOLEAN DEFAULT 1,
  is_verified BOOLEAN DEFAULT 0
);

-- Lideres sociales
CREATE TABLE leaders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  photo_url TEXT,
  contact_info JSON,
  is_verified BOOLEAN DEFAULT 0
);

-- Causas sociales
CREATE TABLE causes (
  id INTEGER PRIMARY KEY,
  leader_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_goal REAL,
  current_amount REAL DEFAULT 0,
  status TEXT CHECK(status IN ('pending', 'active', 'completed', 'archived'))
);

-- Emprendedores
CREATE TABLE entrepreneurs (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE,
  store_name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  photo_url TEXT,
  contact_info JSON,
  is_verified BOOLEAN DEFAULT 0
);

-- Productos (vinculados a causa obligatoriamente)
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  entrepreneur_id INTEGER NOT NULL,
  cause_id INTEGER NOT NULL,  -- OBLIGATORIO
  name TEXT NOT NULL,
  price REAL NOT NULL,
  contribution_text TEXT,
  contribution_amount REAL,
  contribution_type TEXT CHECK(type IN ('percentage', 'fixed')),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT 1
);

-- Transacciones/Donaciones
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  cause_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  status TEXT CHECK(status IN ('pending', 'confirmed', 'completed'))
);
```

### Relaciones

```
users (1) -----> (1) leaders
users (1) -----> (1) entrepreneurs
leaders (1) ---> (N) causes
causes (1) ----> (N) products
entrepreneurs (1) -> (N) products
```

---

## API

### Endpoints (Hono.js)

```
GET  /api/                    -> Welcome message
GET  /api/leaders             -> Listado de lideres con causa activa
GET  /api/leaders/:id         -> Detalle de lider con causas
GET  /api/products            -> Listado de productos
GET  /api/products?cause_id=X -> Productos de una causa
```

### Ejemplo de Respuesta

```json
// GET /api/leaders/1
{
  "id": 1,
  "name": "Elena Marin",
  "bio": "Lider comunitaria...",
  "location": "Buenaventura, Valle del Cauca",
  "photo_url": "https://...",
  "is_verified": true,
  "causes": [
    {
      "id": 1,
      "title": "Comedor Comunitario La Esperanza",
      "target_goal": 5000000,
      "current_amount": 1250000,
      "status": "active"
    }
  ]
}
```

---

## Despliegue

### Cloudflare Pages

```bash
# Build
npm run build

# Deploy
wrangler pages deploy dist
```

### Configuracion en Cloudflare Dashboard

1. Crear proyecto en Pages
2. Conectar repositorio GitHub
3. Build command: `npm run build`
4. Build output: `dist`
5. Agregar bindings de D1 y R2

---

## Credenciales de Prueba

| Rol | Email | Contrasena |
|-----|-------|------------|
| Admin | admin@comoon.co | admin123 |
| Lider | lider@comoon.co | lider123 |
| Emprendedor | emprendedor@comoon.co | emprendedor123 |

---

## Identidad Visual

### Paleta Dracula (Lunar)

| Color | Hex | Uso |
|-------|-----|-----|
| Background | `#282a36` | Fondo principal |
| Current | `#44475a` | Tarjetas, lineas |
| Foreground | `#f8f8f2` | Texto principal |
| Purple | `#bd93f9` | Acento Lider |
| Cyan | `#8be9fd` | Acento Emprendedor |
| Green | `#50fa7b` | Exito, Donacion |
| Pink | `#ff79c6` | Destacados |
| Yellow | `#f1fa8c` | Advertencias |
| Red | `#ff5555` | Errores |

### Efectos CSS

```css
/* Glassmorphism */
.glass {
  background: rgba(68, 71, 90, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glow Lunar */
.btn-primary {
  box-shadow: 0 0 20px rgba(189, 147, 249, 0.3);
}
```

---

## Scripts NPM

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para produccion
npm run preview  # Preview del build
```

---

## Licencia

MIT License

---

## Contacto

- GitHub: [@alejoamorocho](https://github.com/alejoamorocho)

---

**comoon** - Cada compra ilumina una causa.
