# Warranty Wallet - Backend API

API REST para la gestión de garantías, fabricantes y reclamaciones.

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
nano .env
```

### Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Crear tablas en la BD
npm run prisma:migrate

# Cargar datos de prueba
npm run seed
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

El servidor estará en: `http://localhost:3000`

Health check: `http://localhost:3000/health`

## 📁 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma      # Esquema de BD
│   └── seed.ts            # Datos iniciales
├── src/
│   ├── config/            # Configuración (DB, env)
│   ├── controllers/       # Lógica de negocio
│   ├── middleware/        # Middlewares (auth, validation)
│   ├── routes/            # Definición de rutas
│   ├── types/             # Tipos TypeScript
│   ├── utils/             # Utilidades (JWT, passwords)
│   └── server.ts          # Servidor Express
├── .env                   # Variables de entorno
├── package.json
└── tsconfig.json
```

## 🔐 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

### Endpoints Públicos

```bash
# Registro de usuario
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "John Doe",
  "phone": "+34 600 000 000"
}

# Login de usuario
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Login de fabricante
POST /api/auth/manufacturer/login
{
  "email": "contact@samsung.com",
  "password": "password123"
}

# Login de admin
POST /api/auth/admin/login
{
  "email": "admin@warrantywallet.com",
  "password": "password123"
}
```

## 📱 API Endpoints

### Usuarios (App Móvil)

**Base:** `/api/user`

```bash
# Perfil
GET    /profile
PUT    /profile

# Garantías
GET    /warranties
POST   /warranties
GET    /warranties/:id
DELETE /warranties/:id

# Reclamos
POST   /warranties/:id/claim

# Notificaciones
GET    /notifications
PUT    /notifications/:id/read
```

### Fabricantes (Panel Web)

**Base:** `/api/manufacturer`

```bash
# Dashboard
GET    /dashboard

# Productos
GET    /products
POST   /products

# Reclamos
GET    /claims
PUT    /claims/:id
```

### Super Admin (Panel Web)

**Base:** `/api/admin`

```bash
# Dashboard
GET    /dashboard

# Usuarios
GET    /users
PUT    /users/:id/status

# Fabricantes
GET    /manufacturers
POST   /manufacturers
PUT    /manufacturers/:id

# Garantías
GET    /warranties
```

## 🧪 Credenciales de Prueba

Después de ejecutar `npm run seed`:

| Tipo | Email | Password |
|------|-------|----------|
| Super Admin | admin@warrantywallet.com | password123 |
| Usuario | demo@warrantywallet.com | password123 |
| Fabricante (Samsung) | contact@samsung.com | password123 |
| Fabricante (LG) | contact@lg.com | password123 |
| Fabricante (Bosch) | contact@bosch.com | password123 |

## 🗄️ Esquema de Base de Datos

Ver `ARQUITECTURA_PANEL_WEB.md` en la raíz del proyecto para el esquema completo.

Tablas principales:
- `users` - Usuarios de la app móvil
- `manufacturers` - Fabricantes
- `products` - Productos/modelos
- `warranties` - Tickets/garantías
- `warranty_items` - Items individuales con garantía
- `warranty_claims` - Reclamaciones
- `super_admins` - Administradores del sistema

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm start            # Producción (requiere build)
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Interfaz visual de BD
npm run seed         # Cargar datos de prueba
```

## 🌐 Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://user:pass@localhost:5432/warranty_wallet"

# JWT
JWT_SECRET="tu-secret-super-secreto"
JWT_REFRESH_SECRET="otro-secret-super-secreto"

# Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173,http://localhost:19006"
```

## 🚢 Despliegue

### Railway

1. Conectar repositorio GitHub
2. Añadir PostgreSQL addon
3. Configurar variables de entorno
4. Deploy automático

### Render

1. New Web Service
2. Conectar repositorio
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Añadir PostgreSQL en el dashboard

## 📚 Documentación Adicional

- [Arquitectura completa](../ARQUITECTURA_PANEL_WEB.md)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

MIT
