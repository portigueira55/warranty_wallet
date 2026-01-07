# 📚 Guía del Desarrollador - Warranty Wallet v2.0

## 🎯 Visión General

Warranty Wallet es una **Progressive Web App (PWA)** moderna para gestionar garantías de productos con capacidades offline, OCR inteligente, y analytics en tiempo real.

### Stack Tecnológico

**Frontend PWA:**
- React 18.3 + TypeScript 5.7
- Vite 6.0 (build tool ultra-rápido)
- TailwindCSS 3.4 (UI styling)
- React Query 5.62 (data fetching & caching)
- Zustand 5.0 (state management)
- React Router DOM 7.1 (routing)
- Dexie 4.0 (IndexedDB para offline)
- Tesseract.js 5.1 (OCR)
- jsPDF 2.5 (generación de PDFs)
- Recharts 2.15 (gráficas y analytics)
- date-fns 4.1 (manejo de fechas)
- Workbox 7.3 (service workers)

**Backend API:**
- Node.js 20 LTS
- Express 4.21 + TypeScript 5.7
- PostgreSQL (via node-postgres 8.13)
- JWT (autenticación)
- bcryptjs (hashing de contraseñas)
- multer (upload de archivos)
- node-cron (tareas programadas)

**Infraestructura:**
- Railway (hosting)
- PostgreSQL (base de datos)
- Docker (containerización)

---

## 📁 Estructura del Proyecto

```
warranty_wallet/
├── frontend/                 # PWA React App
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── ui/         # Componentes UI base
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── Layout.tsx   # Layout principal con sidebar
│   │   │   └── WarrantyForm.tsx # Formulario con OCR
│   │   ├── pages/          # Páginas principales
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx    # Analytics y stats
│   │   │   ├── Warranties.tsx   # Lista y gestión
│   │   │   ├── Notifications.tsx
│   │   │   └── Settings.tsx
│   │   ├── lib/            # Utilidades y servicios
│   │   │   ├── api.ts      # Cliente HTTP Axios
│   │   │   └── db.ts       # IndexedDB con Dexie
│   │   ├── store/          # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   └── settingsStore.ts
│   │   ├── types/          # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx         # Componente raíz con routing
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Estilos globales
│   ├── public/             # Assets estáticos
│   │   └── manifest.json   # PWA manifest
│   ├── package.json
│   ├── vite.config.ts      # Configuración Vite + PWA
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                 # API Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts      # PostgreSQL connection
│   │   ├── controllers/         # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── warranty.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── transfer.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── errorHandler.ts
│   │   ├── models/             # Data models
│   │   │   ├── user.model.ts
│   │   │   └── warranty.model.ts
│   │   ├── routes/             # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── warranty.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── transfer.routes.ts
│   │   ├── services/           # Business services
│   │   │   └── notification.service.ts
│   │   ├── public/            # Admin panel estático
│   │   └── server.ts          # Entry point + frontend serving
│   ├── Dockerfile            # Multi-stage build
│   ├── package.json
│   └── tsconfig.json
│
├── railway.toml             # Railway config
├── railway.json
├── RAILWAY_DEPLOY.md        # Guía de deploy
└── DEVELOPER_GUIDE.md       # Esta guía

```

---

## 🗄️ Base de Datos PostgreSQL

### Schema

```sql
-- Usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Garantías
CREATE TABLE warranties (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  model VARCHAR(255),
  serial_number VARCHAR(255),
  purchase_date DATE NOT NULL,
  warranty_duration INTEGER DEFAULT 36,  -- meses
  expiry_date DATE NOT NULL,
  category VARCHAR(100),
  store VARCHAR(255),
  price NUMERIC(10, 2),
  receipt_image TEXT,              -- URL de la imagen del recibo
  product_image TEXT,              -- URL de la imagen del producto
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',  -- active | expired | claimed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transferencias
CREATE TABLE transfers (
  id SERIAL PRIMARY KEY,
  warranty_id INTEGER NOT NULL REFERENCES warranties(id) ON DELETE CASCADE,
  from_user_id INTEGER NOT NULL REFERENCES users(id),
  to_user_email VARCHAR(255) NOT NULL,
  to_user_id INTEGER REFERENCES users(id),
  transfer_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',  -- pending | completed | cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Notificaciones
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  warranty_id INTEGER REFERENCES warranties(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,  -- expiring | expired | reminder | info
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Conexión

El backend usa **node-postgres** (`pg`). La configuración está en `/backend/src/config/database.ts`:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined
});
```

Railway inyecta automáticamente `DATABASE_URL` cuando agregas PostgreSQL.

---

## 🔐 Autenticación

### Flow de Auth

1. **Registro**: POST `/api/auth/register`
   - Hash de password con bcryptjs
   - Retorna JWT token + user data

2. **Login**: POST `/api/auth/login`
   - Verifica password
   - Retorna JWT token + user data

3. **Protección de Rutas**:
   - Middleware `authMiddleware` verifica JWT
   - Agrega `userId` y `userEmail` al request

### Ejemplo de uso:

```typescript
// Frontend
import { authAPI } from '@/lib/api';

const { user, token } = await authAPI.login({
  email: 'user@example.com',
  password: 'secret123'
});

// Token se guarda automáticamente en localStorage via Zustand
```

---

## 🎨 Frontend: Componentes Principales

### 1. Dashboard (`/pages/Dashboard.tsx`)

**Features:**
- Tarjetas de estadísticas (total, activas, por vencer, valor total)
- Gráfica de distribución por categoría (Pie Chart)
- Gráfica de garantías por mes (Bar Chart)
- Lista de garantías por vencer (próximos 30 días)
- Garantías añadidas recientemente

**Hooks usados:**
```typescript
const { data: warranties } = useQuery({
  queryKey: ['warranties'],
  queryFn: warrantiesAPI.getAll,
});
```

### 2. Warranties (`/pages/Warranties.tsx`)

**Features:**
- Búsqueda por texto (producto, marca, modelo)
- Filtros por categoría y estado
- Vista en grid con tarjetas
- Modal de detalles completos
- Eliminación con confirmación
- Exportación a PDF
- OCR para escanear recibos

**OCR Implementation:**
```typescript
const handleOCRScan = async (file: File) => {
  const result = await Tesseract.recognize(file, 'spa');
  // Extrae: producto, marca, modelo, precio, fecha
  // Parsea y pre-llena formulario
};
```

### 3. WarrantyForm (`/components/WarrantyForm.tsx`)

**Features:**
- Formulario completo de garantía
- Upload de recibo con OCR automático
- Auto-cálculo de fecha de vencimiento
- Categorías predefinidas
- Validación de campos

### 4. Notificaciones (`/pages/Notifications.tsx`)

**Features:**
- Lista de notificaciones
- Marca como leída (individual/todas)
- Badges de tipo (expiring, expired, reminder, info)
- Timestamps relativos con date-fns

### 5. Settings (`/pages/Settings.tsx`)

**Features:**
- Tema (light/dark/system)
- Idioma (ES/EN) - preparado para i18n
- Notificaciones push (Web Notifications API)
- Info de la app

---

## 💾 Funcionalidad Offline

### IndexedDB con Dexie

**Schema** (`/lib/db.ts`):
```typescript
class WarrantyWalletDB extends Dexie {
  warranties!: Table<Warranty>;
  notifications!: Table<Notification>;
  user!: Table<User>;
  syncQueue!: Table<SyncQueue>;
}
```

**Offline Operations:**
```typescript
// Guardar offline
await saveWarrantyOffline(warranty);

// Leer offline
const warranties = await getWarrantiesOffline();

// Sincronizar cuando vuelva online
await syncWithServer();
```

### Service Worker

Configurado en `vite.config.ts` con Workbox:
- **Precaching**: Assets estáticos (HTML, CSS, JS, imágenes)
- **Runtime Caching**:
  - API calls: NetworkFirst strategy
  - Images: CacheFirst strategy
  - Fonts: CacheFirst con 1 año de expiración

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register     # Crear cuenta
POST   /api/auth/login        # Iniciar sesión
GET    /api/auth/me           # Usuario actual
```

### Warranties
```
GET    /api/warranties         # Listar todas
GET    /api/warranties/:id     # Una específica
POST   /api/warranties         # Crear nueva
PUT    /api/warranties/:id     # Actualizar
DELETE /api/warranties/:id     # Eliminar
GET    /api/warranties/stats   # Estadísticas
POST   /api/warranties/upload  # Subir imagen
```

### Notifications
```
GET    /api/notifications           # Listar todas
PUT    /api/notifications/:id/read  # Marcar como leída
PUT    /api/notifications/read-all  # Marcar todas
```

### Transfers
```
POST   /api/transfer/initiate    # Iniciar transferencia
POST   /api/transfer/complete    # Completar transferencia
GET    /api/transfer/pending     # Transferencias pendientes
```

### Health
```
GET    /api/health   # Health check
```

---

## 🚀 Desarrollo Local

### 1. Setup Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar PostgreSQL local
createdb warranty_wallet

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL local

# Iniciar en modo desarrollo
npm run dev
```

Backend corre en: `http://localhost:3000`

### 2. Setup Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api

# Iniciar en modo desarrollo
npm run dev
```

Frontend corre en: `http://localhost:5173`

### 3. Desarrollo Full-Stack

Opción 1 - **Dos terminales**:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Opción 2 - **Build producción local**:
```bash
# Build frontend
cd frontend && npm run build

# Backend sirve frontend compilado
cd backend && npm run dev
# Visita http://localhost:3000
```

---

## 🐳 Docker Build Local

```bash
# Desde la raíz del proyecto
docker build -f backend/Dockerfile -t warranty-wallet .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  warranty-wallet
```

---

## 🔧 Scripts Útiles

### Frontend
```bash
npm run dev        # Desarrollo
npm run build      # Build producción
npm run preview    # Preview build
npm run lint       # ESLint
```

### Backend
```bash
npm run dev        # Desarrollo con ts-node-dev
npm run build      # Compilar TypeScript
npm start          # Producción (node dist/server.js)
```

---

## 🎨 Personalización UI

### Tailwind Theme

Editar `/frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#6366f1',  // Cambiar color principal
        600: '#4f46e5',
        // ...
      },
    },
  },
}
```

### Dark Mode

El tema se maneja en `/store/settingsStore.ts`:
- `'light'` - Forzar claro
- `'dark'` - Forzar oscuro
- `'system'` - Auto según preferencias del sistema

```typescript
const { theme, setTheme } = useSettingsStore();
setTheme('dark');
```

---

## 📊 Analytics y Estadísticas

### Cálculo de Stats

En el Dashboard (`/pages/Dashboard.tsx`):

```typescript
const stats = {
  total: warranties.length,
  active: warranties.filter(w => w.status === 'active').length,
  expiringSoon: warranties.filter(w => {
    const daysLeft = differenceInDays(new Date(w.expiry_date), new Date());
    return daysLeft > 0 && daysLeft <= 30;
  }).length,
  totalValue: warranties
    .filter(w => w.status === 'active')
    .reduce((sum, w) => sum + (w.price || 0), 0),
};
```

### Gráficas con Recharts

```typescript
import { PieChart, Pie, BarChart, Bar } from 'recharts';

<PieChart>
  <Pie data={categoryData} dataKey="value" nameKey="name" />
</PieChart>
```

---

## 🔔 Notificaciones Push

### Backend: Cron Job

`/backend/src/services/notification.service.ts`:

```typescript
export function startNotificationScheduler() {
  cron.schedule('0 9 * * *', async () => {  // Diario a las 9am
    // Buscar garantías por vencer
    const expiring = await getExpiring Warranties();
    // Crear notificaciones
    for (const warranty of expiring) {
      await createNotification(warranty.user_id, {
        type: 'expiring',
        title: 'Garantía por vencer',
        message: `${warranty.product_name} vence en X días`,
      });
    }
  });
}
```

### Frontend: Web Notifications API

`/pages/Settings.tsx`:

```typescript
const permission = await Notification.requestPermission();
if (permission === 'granted') {
  new Notification('Warranty Wallet', {
    body: '¡Tienes una garantía por vencer!',
    icon: '/pwa-192x192.png',
  });
}
```

---

## 📱 PWA: Características

### Manifest.json

Configurado en `/frontend/public/manifest.json`:
- **name**: Nombre completo de la app
- **short_name**: Nombre corto para home screen
- **icons**: 64x64, 192x192, 512x512
- **display**: `standalone` (app-like)
- **theme_color**: Color de la UI
- **shortcuts**: Accesos rápidos (Nueva Garantía, Dashboard)

### Instalabilidad

La app se puede "instalar" en:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari iOS 16.4+
- ✅ Firefox Android
- ✅ Samsung Internet

**Criterios**:
1. ✅ HTTPS (Railway provee)
2. ✅ manifest.json válido
3. ✅ Service Worker registrado
4. ✅ Iconos apropiados

---

## 🧪 Testing

### Backend Tests (agregar)

```bash
npm install --save-dev jest @types/jest ts-jest supertest

# jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};

# Ejemplo test
describe('Auth API', () => {
  it('should register user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: '123456' });
    expect(res.status).toBe(200);
  });
});
```

### Frontend Tests (agregar)

```bash
npm install --save-dev vitest @testing-library/react

# vitest.config.ts
export default {
  test: {
    environment: 'jsdom',
  },
};

# Ejemplo test
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

---

## 🐛 Debugging

### Backend

```typescript
// Logs detallados en database.ts
console.log('Executed query', { text, duration, rows });

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Frontend

```typescript
// React Query DevTools (agregar)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>

// Zustand DevTools
import { devtools } from 'zustand/middleware';
export const useStore = create(devtools(...));
```

### Network

```bash
# Ver requests en Chrome DevTools
Network tab → Filter: /api/

# Service Worker
Application tab → Service Workers → Ver estado
Application tab → Cache Storage → Ver cache
```

---

## 🔒 Seguridad

### Buenas Prácticas Implementadas

✅ **Hashing de Contraseñas**: bcryptjs con salt rounds
✅ **JWT Tokens**: Firmados con secreto, expiración 7d
✅ **CORS**: Configurado en backend
✅ **SQL Injection**: Prevented con parametrized queries
✅ **XSS**: React escapa HTML por defecto
✅ **HTTPS**: Railway provee SSL
✅ **Environment Variables**: Secretos en Railway

### Mejoras Recomendadas

🔸 **Rate Limiting**: express-rate-limit
🔸 **Helmet.js**: Headers de seguridad
🔸 **Input Validation**: express-validator (ya incluido)
🔸 **CSRF Protection**: csurf
🔸 **File Upload Limits**: Configurar multer limits

---

## 📈 Performance

### Frontend Optimizations

✅ **Code Splitting**: Vite automático con dynamic imports
✅ **Tree Shaking**: Vite elimina código no usado
✅ **Lazy Loading**: Imágenes con loading="lazy"
✅ **Service Worker Caching**: Assets pre-cacheados
✅ **React Query**: Cache de 5 minutos por defecto

### Backend Optimizations

✅ **Connection Pooling**: PostgreSQL pool
✅ **Query Logging**: Duración de queries
🔸 **Índices en DB**: Agregar en campos frecuentes
🔸 **Pagination**: Implementar en listados grandes
🔸 **Compression**: gzip middleware

### Lighthouse Score Target

- 🎯 Performance: 90+
- 🎯 Accessibility: 95+
- 🎯 Best Practices: 95+
- 🎯 SEO: 90+
- 🎯 PWA: 100 (installable)

---

## 📦 Dependencias Principales

### Versiones Actuales (2026-01-07)

```json
// Frontend
"react": "^18.3.1"
"vite": "^6.0.7"
"typescript": "^5.7.2"
"tailwindcss": "^3.4.17"
"@tanstack/react-query": "^5.62.15"
"dexie": "^4.0.10"

// Backend
"express": "^4.21.2"
"pg": "^8.13.1"
"typescript": "^5.7.2"
"jsonwebtoken": "^9.0.2"
"node": ">=20.x"
```

### Actualizar Dependencias

```bash
# Check updates
npm outdated

# Update
npm update

# Major updates (cuidado!)
npx npm-check-updates -u
npm install
```

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'pg'"

```bash
cd backend
npm install pg @types/pg
```

### Error: Build failed - TypeScript

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: Database connection refused

```bash
# Verificar PostgreSQL está corriendo
pg_isready

# Verificar DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### PWA no se instala

1. ✅ HTTPS requerido (no funciona en localhost HTTP)
2. ✅ manifest.json accesible
3. ✅ Service Worker registrado
4. ✅ Iconos 192x192 y 512x512

```bash
# Chrome DevTools → Application → Manifest
# Verificar errores
```

---

## 🚢 Deploy a Producción

Ver **RAILWAY_DEPLOY.md** para guía completa.

Quick steps:
1. Push a GitHub
2. Crear proyecto en Railway
3. Agregar PostgreSQL
4. Configurar variables de entorno
5. Deploy automático!

---

## 📝 Contribuir

### Git Workflow

```bash
# Crear branch feature
git checkout -b feature/nueva-funcionalidad

# Commit
git add .
git commit -m "feat: descripción de cambio"

# Push
git push -u origin feature/nueva-funcionalidad

# Crear PR en GitHub
```

### Commit Convention

- `feat:` Nueva funcionalidad
- `fix:` Bug fix
- `docs:` Documentación
- `style:` Formato, no afecta código
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Mantenimiento

---

## 📞 Soporte

**Documentación:**
- Railway: https://docs.railway.app/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- PostgreSQL: https://www.postgresql.org/docs/

**Issues:** GitHub Issues del repositorio

---

¡Feliz coding! 🎉

**Última actualización:** 2026-01-07
**Versión:** 2.0.0
