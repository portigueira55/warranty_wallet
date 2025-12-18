@echo off
REM 🚀 Warranty Wallet - Script de Setup Automático del Backend (Windows)
REM Este script configura automáticamente el backend en un solo comando

echo ╔═══════════════════════════════════════════════════════╗
echo ║  🚀 Warranty Wallet - Setup Backend Automático       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

REM Paso 1: Verificar que estamos en el directorio correcto
if not exist "package.json" (
  echo ❌ Error: Ejecuta este script desde la raíz del proyecto
  echo    Uso: setup-backend.bat
  exit /b 1
)

REM Paso 2: Ir al directorio backend
echo 📁 Entrando al directorio backend...
cd backend

REM Paso 3: Instalar dependencias
echo.
echo 📦 Instalando dependencias del backend...
call npm install
if errorlevel 1 (
  echo ❌ Error instalando dependencias
  exit /b 1
)

REM Paso 4: Generar cliente Prisma
echo.
echo 🔧 Generando cliente Prisma...
call npm run prisma:generate
if errorlevel 1 (
  echo ❌ Error generando cliente Prisma
  exit /b 1
)

REM Paso 5: Ejecutar migraciones
echo.
echo 🗄️  Ejecutando migraciones de base de datos...
call npm run prisma:migrate
if errorlevel 1 (
  echo ❌ Error ejecutando migraciones
  exit /b 1
)

REM Paso 6: Cargar datos de prueba
echo.
echo 📊 Cargando datos de prueba...
call npm run seed
if errorlevel 1 (
  echo ❌ Error cargando datos de prueba
  exit /b 1
)

REM Paso 7: Mostrar datos cargados
echo.
echo ✅ Setup completado! Aquí están los datos cargados:
echo.
node show-data.js

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║  ✅ Backend configurado correctamente                 ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo 🚀 Para iniciar el servidor:
echo    cd backend
echo    npm run dev
echo.
echo 🔑 Credenciales de prueba:
echo    Super Admin: admin@warrantywallet.com / password123
echo    Usuario Demo: demo@warrantywallet.com / password123
echo.
echo 📡 API disponible en: http://localhost:3000
echo 🏥 Health check: http://localhost:3000/health
echo.

cd ..
pause
