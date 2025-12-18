# Configuración de PostgreSQL para Warranty Wallet

Este documento explica cómo instalar y configurar PostgreSQL para el backend.

## Opción 1: PostgreSQL Local (Desarrollo)

### Ubuntu/Debian

```bash
# Actualizar repositorios
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Verificar instalación
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Habilitar inicio automático
sudo systemctl enable postgresql
```

### macOS (con Homebrew)

```bash
# Instalar PostgreSQL
brew install postgresql@14

# Iniciar servicio
brew services start postgresql@14

# Verificar instalación
psql --version
```

### Windows

1. Descargar desde: https://www.postgresql.org/download/windows/
2. Ejecutar instalador
3. Configurar password para usuario `postgres`
4. Usar puerto por defecto: 5432

## Opción 2: PostgreSQL con Docker (Recomendado)

### Crear archivo docker-compose.yml

En la raíz del proyecto backend:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: warranty-wallet-db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: warranty_wallet
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Iniciar con Docker

```bash
# Iniciar base de datos
docker-compose up -d

# Ver logs
docker-compose logs -f postgres

# Detener
docker-compose down

# Detener y eliminar datos
docker-compose down -v
```

## Configurar Base de Datos

### 1. Conectar a PostgreSQL

```bash
# Linux/macOS
sudo -u postgres psql

# Windows o con Docker
psql -U postgres -h localhost
```

### 2. Crear base de datos (si no existe)

```sql
-- Crear base de datos
CREATE DATABASE warranty_wallet;

-- Crear usuario (opcional, si no usas postgres)
CREATE USER warranty_user WITH PASSWORD 'secure_password_here';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE warranty_wallet TO warranty_user;

-- Salir
\q
```

### 3. Configurar .env

Editar `backend/.env`:

```env
# Con usuario postgres (por defecto)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/warranty_wallet"

# Con usuario custom
DATABASE_URL="postgresql://warranty_user:secure_password_here@localhost:5432/warranty_wallet"

# Con Docker en red custom
DATABASE_URL="postgresql://postgres:postgres@warranty-wallet-db:5432/warranty_wallet"
```

### 4. Ejecutar migraciones

```bash
cd backend

# Generar cliente Prisma
npm run prisma:generate

# Crear tablas
npm run prisma:migrate

# Cargar datos de prueba
npm run seed
```

## Opción 3: PostgreSQL en la Nube (Producción)

### Railway.app (Gratis)

1. Ir a https://railway.app
2. Crear cuenta con GitHub
3. New Project → Provision PostgreSQL
4. Copiar DATABASE_URL desde Variables
5. Pegar en `.env`

### Supabase (Gratis)

1. Ir a https://supabase.com
2. Crear cuenta
3. New Project
4. Copiar `Connection String` (Transaction Pooling)
5. Pegar en `.env`

### Render.com (Gratis)

1. Ir a https://render.com
2. New → PostgreSQL
3. Copiar Internal/External Database URL
4. Pegar en `.env`

## Verificar Conexión

```bash
cd backend

# Verificar conexión
npx prisma db push

# Ver base de datos en navegador
npx prisma studio
```

Esto abrirá http://localhost:5555 con una interfaz visual de la BD.

## Comandos Útiles

```bash
# Generar cliente Prisma
npm run prisma:generate

# Crear migración
npx prisma migrate dev --name init

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (¡CUIDADO!)
npx prisma migrate reset

# Ver datos en navegador
npm run prisma:studio

# Ejecutar seed
npm run seed
```

## Solución de Problemas

### Error: "relation does not exist"

```bash
# Ejecutar migraciones
npm run prisma:migrate
```

### Error: "Can't reach database server"

1. Verificar que PostgreSQL está corriendo
2. Verificar puerto 5432 no está bloqueado
3. Verificar credenciales en .env

### Error: "password authentication failed"

1. Verificar usuario y password en .env
2. Resetear password de postgres:

```bash
sudo -u postgres psql
\password postgres
```

### Ver logs de PostgreSQL

```bash
# Linux
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# macOS
tail -f /usr/local/var/log/postgres.log

# Docker
docker-compose logs -f postgres
```

## Siguiente Paso

Una vez configurada la base de datos:

```bash
cd backend

# Iniciar servidor
npm run dev
```

El servidor estará en: http://localhost:3000

Health check: http://localhost:3000/health
