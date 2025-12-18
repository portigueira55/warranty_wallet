# ✅ Guía Completa - Warranty Wallet App

## 📁 Estructura del Proyecto
Tu proyecto en `C:\Users\mario\APP CON IA\warranty_wallet` tiene:
```
warranty_wallet/           ← APP MÓVIL (raíz)
├── App.tsx               ← Código principal
├── package.json          ← Dependencias de Expo
├── app.json              ← Configuración de Expo
├── src/                  ← Código fuente app
├── backend/              ← Backend API (Node.js)
│   └── package.json      ← Dependencias del backend
└── admin-panel/          ← Panel web admin
    └── package.json      ← Dependencias del panel
```

## 🚀 Paso a Paso - Primera Vez

### 1️⃣ Instalar dependencias de la APP MÓVIL
```powershell
# Asegúrate de estar en: C:\Users\mario\APP CON IA\warranty_wallet
cd "C:\Users\mario\APP CON IA\warranty_wallet"

# Instalar
npm install
```

### 2️⃣ Iniciar Expo
```powershell
npx expo start
```

### 3️⃣ **IMPORTANTE: Presiona 'w' para abrir en WEB**
- ❌ NO uses el QR (no necesitas Expo Go)
- ❌ NO uses 'a' para Android (necesita emulador instalado)
- ✅ **Presiona 'w'** para abrir en tu navegador Chrome/Edge

### 4️⃣ Cuando se abra el navegador
Verás la pantalla de login. Usa:
- **Email:** demo@warrantywallet.com
- **Password:** password123

## 🔧 Si tienes el backend en local

### Backend (Puerto 3000)
```powershell
cd "C:\Users\mario\APP CON IA\warranty_wallet\backend"
npm install
npm run dev
```

Debe mostrar: `✓ Server running on port 3000`

## ❓ Preguntas Frecuentes

**¿Necesito cuenta de Expo?**
- NO para desarrollo local
- Solo necesitas si vas a publicar la app

**¿Por qué sale error de Android?**
- Porque Expo intenta abrir Android automáticamente
- Si no tienes emulador, ignora el error en rojo
- Presiona 'w' para abrir en web

**¿Dónde está configurada la API?**
- En: `src/config/api.ts`
- Ya apunta a `http://localhost:3000` ✅

## 🌐 URLs importantes

| Servicio | URL |
|----------|-----|
| App Web | http://localhost:8081 |
| Backend API | http://localhost:3000 |
| Backend Health | http://localhost:3000/health |
| Admin Panel | http://localhost:5173 |

## 🐛 Solución de Problemas

**Error: "Unable to find expo"**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

**Error: PowerShell no reconoce rmdir /s /q**
```powershell
# Usa este comando en PowerShell:
Remove-Item -Recurse -Force node_modules
```

**Backend no arranca**
```powershell
cd backend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```
