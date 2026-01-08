#!/bin/bash

# ============================================
# Script Automático de Setup para VPS
# Warranty Wallet - Backend Setup
# ============================================

set -e  # Parar si hay algún error

echo "🚀 Iniciando setup de Warranty Wallet Backend..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde la carpeta 'backend'${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Paso 1/5: Instalando dependencias...${NC}"
npm install

echo -e "${YELLOW}⚙️  Paso 2/5: Verificando archivo .env...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No existe .env, creando desde .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales reales!${NC}"
    echo -e "${RED}   Ejecuta: nano .env${NC}"
    read -p "Presiona Enter cuando hayas editado .env..."
else
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
fi

echo -e "${YELLOW}🔨 Paso 3/5: Compilando TypeScript...${NC}"
npm run build

echo -e "${YELLOW}🗄️  Paso 4/5: Configurando base de datos PostgreSQL...${NC}"
echo -e "${YELLOW}Se abrirá PostgreSQL para crear la base de datos.${NC}"
echo -e "${YELLOW}Necesitarás ingresar la contraseña del usuario 'postgres'${NC}"
echo ""
read -p "Presiona Enter para continuar..."

# Ejecutar script SQL de inicialización
sudo -u postgres psql -f init-database.sql

echo ""
echo -e "${GREEN}✅ Base de datos creada!${NC}"
echo ""

echo -e "${YELLOW}🧪 Paso 5/5: Probando conexión a base de datos...${NC}"
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ Error de conexión:', err.message);
    process.exit(1);
  }
  console.log('✅ Conexión exitosa a PostgreSQL!');
  console.log('⏰ Hora del servidor DB:', res.rows[0].now);
  pool.end();
});
"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 Setup completado!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Próximos pasos:"
echo -e "  1. ${YELLOW}node dist/server.js${NC} - Para arrancar el servidor"
echo -e "  2. ${YELLOW}pm2 start dist/server.js --name warranty-wallet${NC} - Para producción"
echo ""
echo -e "Comandos útiles:"
echo -e "  - Ver logs: ${YELLOW}pm2 logs warranty-wallet${NC}"
echo -e "  - Reiniciar: ${YELLOW}pm2 restart warranty-wallet${NC}"
echo -e "  - Estado: ${YELLOW}pm2 status${NC}"
echo ""
