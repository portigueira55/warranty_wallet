# Arquitectura Panel Web - Warranty Wallet

## 📋 Resumen Ejecutivo

El sistema completo se compone de:
1. **App Móvil (React Native)** - Ya existente, donde los usuarios gestionan garantías
2. **Backend API (Node.js + Express)** - Servidor central que conecta app y panels
3. **Panel Web Super Admin** - Gestión completa del sistema
4. **Panel Web Fabricantes** - Gestión de garantías de sus productos
5. **Base de Datos (PostgreSQL)** - Almacenamiento centralizado

---

## 🏗️ Arquitectura General

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   App Móvil     │────▶│   Backend API    │◀────│ Panel Web Admin │
│  (React Native) │     │ (Node + Express) │     │    (React)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               │
                        ┌──────▼──────────┐
                        │   PostgreSQL    │
                        │    Database     │
                        └─────────────────┘
                               ▲
                               │
                        ┌──────┴──────────┐
                        │ Panel Fabricantes│
                        │    (React)      │
                        └─────────────────┘
```

---

## 🗄️ Base de Datos - Esquema PostgreSQL

### Tablas Principales

```sql
-- Tabla de usuarios (clientes de la app)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Tabla de fabricantes
CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  logo_url TEXT,
  contact_phone VARCHAR(20),
  support_email VARCHAR(255),
  website TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Tabla de productos/modelos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID REFERENCES manufacturers(id),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  default_warranty_months INTEGER DEFAULT 36,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de tickets/garantías
CREATE TABLE warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  store_name VARCHAR(255),
  store_address TEXT,
  ticket_number VARCHAR(100),
  purchase_date DATE NOT NULL,
  purchase_time TIME,
  total_amount DECIMAL(10, 2),
  ticket_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de items de warranty (productos del ticket)
CREATE TABLE warranty_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warranty_id UUID REFERENCES warranties(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  sku VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  warranty_end_date DATE NOT NULL,
  serial_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active', -- active, expiring, expired, claimed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de reclamos de garantía
CREATE TABLE warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warranty_item_id UUID REFERENCES warranty_items(id),
  user_id UUID REFERENCES users(id),
  manufacturer_id UUID REFERENCES manufacturers(id),
  issue_description TEXT NOT NULL,
  case_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, resolved, rejected
  photos JSON, -- Array de URLs
  videos JSON, -- Array de URLs
  manufacturer_response TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de extensiones de garantía
CREATE TABLE warranty_extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warranty_item_id UUID REFERENCES warranty_items(id),
  months_extended INTEGER NOT NULL,
  price DECIMAL(10, 2),
  purchased_at TIMESTAMP DEFAULT NOW(),
  new_end_date DATE NOT NULL
);

-- Tabla de notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- warranty_expiring, claim_update, etc
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de grupos familiares
CREATE TABLE family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de miembros de grupos
CREATE TABLE family_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de super admins
CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

---

## 🔐 Backend API - Endpoints Principales

### Autenticación

```javascript
// POST /api/auth/register - Registro de usuarios
// POST /api/auth/login - Login de usuarios
// POST /api/auth/refresh - Refresh token
// POST /api/auth/logout - Cerrar sesión

// POST /api/manufacturer/auth/login - Login fabricantes
// POST /api/admin/auth/login - Login super admin
```

### Usuarios (App Móvil)

```javascript
// GET /api/user/profile - Perfil del usuario
// PUT /api/user/profile - Actualizar perfil
// GET /api/user/warranties - Lista de garantías
// POST /api/user/warranties - Crear nueva garantía (con OCR)
// GET /api/user/warranties/:id - Detalle de garantía
// PUT /api/user/warranties/:id - Actualizar garantía
// DELETE /api/user/warranties/:id - Eliminar garantía
// POST /api/user/warranties/:id/extend - Extender garantía
// POST /api/user/warranties/:id/claim - Crear reclamo
// GET /api/user/notifications - Obtener notificaciones
// PUT /api/user/notifications/:id/read - Marcar como leída
```

### Fabricantes (Panel Web)

```javascript
// GET /api/manufacturer/dashboard - Dashboard stats
// GET /api/manufacturer/products - Lista de productos
// POST /api/manufacturer/products - Crear producto
// PUT /api/manufacturer/products/:id - Actualizar producto
// GET /api/manufacturer/warranties - Garantías activas
// GET /api/manufacturer/claims - Reclamos recibidos
// PUT /api/manufacturer/claims/:id - Responder reclamo
// GET /api/manufacturer/analytics - Analíticas
```

### Super Admin (Panel Web)

```javascript
// GET /api/admin/dashboard - Dashboard general
// GET /api/admin/users - Lista de usuarios
// PUT /api/admin/users/:id/status - Activar/desactivar usuario
// GET /api/admin/manufacturers - Lista de fabricantes
// POST /api/admin/manufacturers - Crear fabricante
// PUT /api/admin/manufacturers/:id - Actualizar fabricante
// DELETE /api/admin/manufacturers/:id - Eliminar fabricante
// GET /api/admin/warranties - Todas las garantías
// GET /api/admin/analytics - Analíticas completas
// GET /api/admin/logs - Logs del sistema
```

---

## 💻 Panel Web - Stack Tecnológico

### Frontend (React + TypeScript)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "typescript": "^5.3.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "recharts": "^2.10.0",
    "react-table": "^8.0.0",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  }
}
```

### Backend (Node.js + Express)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.3.0",
    "@prisma/client": "^5.7.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0",
    "multer": "^1.4.5",
    "sharp": "^0.33.0",
    "tesseract.js": "^5.0.0",
    "aws-sdk": "^2.1500.0",
    "nodemailer": "^6.9.7"
  }
}
```

---

## 🚀 Desarrollo Local

### Paso 1: Configurar Backend

```bash
# Clonar repositorio
git clone <repo> warranty-backend
cd warranty-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/warranty_wallet"
JWT_SECRET="tu-secret-super-secreto"
JWT_REFRESH_SECRET="otro-secret-super-secreto"
PORT=3000
NODE_ENV=development
AWS_ACCESS_KEY_ID=tu-aws-key
AWS_SECRET_ACCESS_KEY=tu-aws-secret
AWS_BUCKET_NAME=warranty-images
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password
EOF

# Inicializar base de datos
npx prisma migrate dev
npx prisma db seed

# Iniciar servidor
npm run dev
```

### Paso 2: Configurar Panel Web Admin

```bash
# Clonar repositorio
git clone <repo> warranty-admin-panel
cd warranty-admin-panel

# Instalar dependencias
npm install

# Configurar variables de entorno
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
EOF

# Iniciar desarrollo
npm run dev
```

### Paso 3: Configurar Panel Fabricantes

```bash
# Clonar repositorio
git clone <repo> warranty-manufacturer-panel
cd warranty-manufacturer-panel

# Instalar dependencias
npm install

# Configurar variables de entorno
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
EOF

# Iniciar desarrollo
npm run dev
```

### Paso 4: Conectar App Móvil

```javascript
// src/config/api.ts
export const API_CONFIG = {
  // Para desarrollo local (emulador Android)
  baseURL: __DEV__
    ? 'http://10.0.2.2:3000/api'  // Android emulator
    // ? 'http://localhost:3000/api'  // iOS simulator
    : 'https://api.warranty-wallet.com/api', // Producción

  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
```

---

## 🎨 Panel Super Admin - Características

### Dashboard

- **Métricas Generales**
  - Total de usuarios registrados
  - Total de garantías activas
  - Total de fabricantes
  - Ingresos por extensiones
  - Gráfica de registros mensuales
  - Top 10 productos más registrados
  - Top 10 tiendas más usadas

### Gestión de Usuarios

- Lista completa con búsqueda y filtros
- Ver perfil detallado
- Ver garantías del usuario
- Activar/desactivar cuenta
- Eliminar usuario (soft delete)
- Enviar notificación

### Gestión de Fabricantes

- Lista completa con búsqueda
- Crear nuevo fabricante
- Editar información
- Desactivar fabricante
- Ver productos del fabricante
- Ver estadísticas de garantías
- Ver reclamos recibidos

### Analíticas

- Dashboard de KPIs
- Gráficas de tendencias
- Reportes descargables (PDF, Excel)
- Filtros por fecha, categoría, fabricante
- Mapa de calor de garantías por ubicación

---

## 🏭 Panel Fabricantes - Características

### Dashboard

- **Métricas de Productos**
  - Productos registrados
  - Garantías activas
  - Garantías próximas a vencer
  - Reclamos pendientes
  - Tasa de satisfacción

### Gestión de Productos

- Lista de productos propios
- Agregar nuevo modelo
- Editar información
- Subir imagen
- Configurar garantía por defecto
- Categorizar producto

### Gestión de Reclamos

- Lista de reclamos recibidos
- Ver detalle con fotos/videos
- Responder al cliente
- Cambiar estado (aprobar/rechazar)
- Historial de comunicaciones
- Estadísticas de reclamos

### Analíticas

- Productos más vendidos
- Productos con más reclamos
- Tiempo promedio de resolución
- Satisfacción del cliente
- Tendencias de fallos

---

## 🔌 Conexión App ↔ Backend

### Flujo de Autenticación

```javascript
// 1. Usuario se registra/loguea en la app
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// 2. Backend retorna tokens
const { accessToken, refreshToken, user } = response.data;

// 3. App guarda tokens en SecureStorage
await SecureStorage.setItem('accessToken', accessToken);
await SecureStorage.setItem('refreshToken', refreshToken);

// 4. Todas las peticiones incluyen el token
const config = {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
};

// 5. Si token expira, refresh automático
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      const newToken = await refreshAccessToken();
      error.config.headers['Authorization'] = `Bearer ${newToken}`;
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Flujo de Creación de Garantía

```javascript
// 1. Usuario escanea ticket en la app
const imageUri = await ImagePicker.launchCamera();

// 2. Subir imagen al backend
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'ticket.jpg'
});

const uploadResponse = await api.post('/upload/ticket', formData);
const { imageUrl } = uploadResponse.data;

// 3. Backend procesa OCR
const ocrResponse = await api.post('/ocr/process', {
  imageUrl
});
const { extractedData } = ocrResponse.data;

// 4. Usuario confirma/edita datos extraídos
const warranty = {
  ...extractedData,
  userId: user.id,
  ticketImageUrl: imageUrl
};

// 5. Crear garantía en BD
const createResponse = await api.post('/user/warranties', warranty);
```

---

## 📱 Diferencias App Simulada vs Real

### App Actual (Simulada)

```javascript
// Datos en memoria
const tickets = getMockTickets();

// Sin autenticación real
const user = { id: 'demo-user', username: 'demo' };

// Sin persistencia
// Los datos se pierden al cerrar app
```

### App Real (Con Backend)

```javascript
// Datos desde API
const tickets = await api.get('/user/warranties');

// Autenticación real
const user = await api.post('/auth/login', credentials);

// Persistencia en BD
// Datos permanentes, sincronizados entre dispositivos
```

---

## 🌐 Despliegue en Producción

### Backend (Railway / Render)

```bash
# 1. Conectar repositorio Git
# 2. Configurar variables de entorno en el dashboard
# 3. Deploy automático con cada push

# Variables necesarias:
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
```

### Panel Web (Vercel / Netlify)

```bash
# 1. Conectar repositorio
# 2. Configurar build:
#    Build command: npm run build
#    Output directory: dist
# 3. Deploy automático
```

### Base de Datos (Railway / Supabase)

```bash
# Railway PostgreSQL:
# 1. Crear nuevo proyecto
# 2. Añadir PostgreSQL
# 3. Copiar DATABASE_URL
# 4. Ejecutar migraciones: npx prisma migrate deploy
```

---

## 💰 Costos Estimados

### Desarrollo Local (Gratis)

- PostgreSQL local
- Backend local (localhost:3000)
- Panel web local (localhost:5173)
- App React Native (emulador)

### Producción (Mensual)

- **Backend + BD**: Railway $5-15/mes
- **Storage (AWS S3)**: $1-5/mes
- **Panel Web**: Vercel/Netlify $0 (plan gratuito)
- **Email (SendGrid)**: $0-15/mes
- **Total**: ~$10-40/mes

---

## 🔜 Próximos Pasos

1. **Decidir**: ¿Continuar con app demo o construir backend real?
2. **Si backend real**:
   - Crear repositorio backend
   - Configurar BD PostgreSQL
   - Implementar API básica
   - Conectar app móvil
3. **Si panel web**:
   - Crear repositorio panel admin
   - Crear repositorio panel fabricantes
   - Implementar autenticación
   - Implementar dashboards

¿Quieres que empiece con el backend o prefieres seguir mejorando la app demo?
