#!/bin/bash

# 🚀 Warranty Wallet - Script de Setup Automático del Backend
# Este script configura automáticamente el backend en un solo comando

set -e  # Detener si hay algún error

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🚀 Warranty Wallet - Setup Backend Automático       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Paso 1: Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
  echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
  echo "   Uso: ./setup-backend.sh"
  exit 1
fi

# Paso 2: Ir al directorio backend
echo "📁 Entrando al directorio backend..."
cd backend

# Paso 3: Instalar dependencias
echo ""
echo "📦 Instalando dependencias del backend..."
npm install

# Paso 4: Generar cliente Prisma
echo ""
echo "🔧 Generando cliente Prisma..."
npm run prisma:generate

# Paso 5: Ejecutar migraciones
echo ""
echo "🗄️  Ejecutando migraciones de base de datos..."
npm run prisma:migrate

# Paso 6: Cargar datos de prueba
echo ""
echo "📊 Cargando datos de prueba..."
npm run seed

# Paso 7: Mostrar datos cargados
echo ""
echo "✅ Setup completado! Aquí están los datos cargados:"
echo ""
node show-data.js

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ Backend configurado correctamente                 ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "🔑 Credenciales de prueba:"
echo "   Super Admin: admin@warrantywallet.com / password123"
echo "   Usuario Demo: demo@warrantywallet.com / password123"
echo ""
echo "📡 API disponible en: http://localhost:3000"
echo "🏥 Health check: http://localhost:3000/health"
echo ""
