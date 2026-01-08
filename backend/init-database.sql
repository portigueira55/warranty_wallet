-- ============================================
-- Script de Inicialización de Base de Datos
-- Warranty Wallet - PostgreSQL Setup
-- ============================================

-- 1. Crear base de datos
CREATE DATABASE warranty_wallet;

-- 2. Crear usuario con contraseña
-- ⚠️ CAMBIA 'tu_password_segura_aqui' por una contraseña real
CREATE USER warranty_user WITH PASSWORD 'tu_password_segura_aqui';

-- 3. Dar todos los permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE warranty_wallet TO warranty_user;

-- 4. Conectarse a la base de datos recién creada
\c warranty_wallet

-- 5. Dar permisos sobre el schema public
GRANT ALL ON SCHEMA public TO warranty_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO warranty_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO warranty_user;

-- ============================================
-- LISTO!
-- Las tablas se crearán automáticamente cuando
-- arranques el backend por primera vez.
-- ============================================

-- Para verificar que todo está ok:
\l                          -- Lista todas las bases de datos
\du                         -- Lista todos los usuarios
\c warranty_wallet          -- Conecta a la base de datos
\dt                         -- Lista las tablas (estará vacío hasta que arranques el backend)
