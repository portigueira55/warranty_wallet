# 🚀 Quick Start - Warranty Wallet Backend

## Pasos Rápidos

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar Base de Datos

**Opción A: Docker (Recomendado)**

```bash
# Iniciar PostgreSQL
docker-compose up -d

# Ver logs
docker-compose logs -f
```

**Opción B: PostgreSQL local**

Ver [SETUP_DATABASE.md](./SETUP_DATABASE.md) para instrucciones completas.

### 3. Configurar variables de entorno

Ya está configurado en `.env` con valores por defecto para desarrollo.

Si usas otra BD, edita `.env`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/warranty_wallet"
```

### 4. Inicializar Base de Datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Crear tablas
npm run prisma:migrate

# Cargar datos de prueba
npm run seed
```

### 5. Iniciar servidor

```bash
npm run dev
```

✅ Servidor corriendo en: http://localhost:3000

✅ Health check: http://localhost:3000/health

## Credenciales de Prueba

| Tipo | Email | Password |
|------|-------|----------|
| Super Admin | admin@warrantywallet.com | password123 |
| Usuario | demo@warrantywallet.com | password123 |
| Fabricante (Samsung) | contact@samsung.com | password123 |
| Fabricante (LG) | contact@lg.com | password123 |

## Probar la API

### 1. Login de usuario

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@warrantywallet.com",
    "password": "password123"
  }'
```

Guarda el `accessToken` de la respuesta.

### 2. Obtener garantías

```bash
curl http://localhost:3000/api/user/warranties \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 3. Explorar datos en navegador

```bash
npm run prisma:studio
```

Abre http://localhost:5555

## Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Datos iniciales
├── src/
│   ├── config/            # Configuración (DB, env)
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/       # Lógica de negocio
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── manufacturerController.ts
│   │   └── adminController.ts
│   ├── middleware/        # Middlewares
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/            # Rutas API
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── manufacturer.ts
│   │   └── admin.ts
│   ├── types/             # Tipos TypeScript
│   │   └── index.ts
│   ├── utils/             # Utilidades
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── response.ts
│   └── server.ts          # Servidor Express
├── .env                   # Variables de entorno
├── docker-compose.yml     # PostgreSQL con Docker
├── package.json
└── tsconfig.json
```

## API Endpoints

### Autenticación

```
POST /api/auth/register          - Registro de usuario
POST /api/auth/login             - Login de usuario
POST /api/auth/manufacturer/login - Login de fabricante
POST /api/auth/admin/login       - Login de admin
```

### Usuarios (requiere auth)

```
GET    /api/user/profile         - Perfil del usuario
PUT    /api/user/profile         - Actualizar perfil
GET    /api/user/warranties      - Lista de garantías
POST   /api/user/warranties      - Crear garantía
GET    /api/user/warranties/:id  - Detalle de garantía
DELETE /api/user/warranties/:id  - Eliminar garantía
POST   /api/user/warranties/:id/claim - Crear reclamación
GET    /api/user/notifications   - Obtener notificaciones
```

### Fabricantes (requiere auth)

```
GET  /api/manufacturer/dashboard  - Dashboard con stats
GET  /api/manufacturer/products   - Lista de productos
POST /api/manufacturer/products   - Crear producto
GET  /api/manufacturer/claims     - Lista de reclamaciones
PUT  /api/manufacturer/claims/:id - Responder reclamación
```

### Super Admin (requiere auth)

```
GET  /api/admin/dashboard         - Dashboard general
GET  /api/admin/users             - Lista de usuarios
PUT  /api/admin/users/:id/status  - Activar/desactivar usuario
GET  /api/admin/manufacturers     - Lista de fabricantes
POST /api/admin/manufacturers     - Crear fabricante
PUT  /api/admin/manufacturers/:id - Actualizar fabricante
GET  /api/admin/warranties        - Todas las garantías
```

## Comandos Útiles

```bash
npm run dev           # Desarrollo con hot-reload
npm run build         # Compilar TypeScript
npm start             # Producción (requiere build primero)

npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Interfaz visual BD
npm run seed             # Cargar datos de prueba
```

## Siguiente Paso

Una vez que el backend funciona:

1. **Conectar App Móvil**: Editar `src/config/api.ts` en la app
2. **Crear Panel Web Admin**: React + TailwindCSS
3. **Crear Panel Fabricantes**: React + TailwindCSS

Ver [ARQUITECTURA_PANEL_WEB.md](../ARQUITECTURA_PANEL_WEB.md) para más detalles.

## Solución de Problemas

**Error: Can't reach database server**
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# O reiniciar
docker-compose restart
```

**Error: relation does not exist**
```bash
# Ejecutar migraciones
npm run prisma:migrate
```

**Error: Port 3000 already in use**
```bash
# Cambiar puerto en .env
PORT=3001
```

## Documentación Completa

- [README.md](./README.md) - Documentación completa
- [SETUP_DATABASE.md](./SETUP_DATABASE.md) - Configuración de PostgreSQL
- [../ARQUITECTURA_PANEL_WEB.md](../ARQUITECTURA_PANEL_WEB.md) - Arquitectura completa
