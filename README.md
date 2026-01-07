# 🔖 Warranty Wallet v2.0

> **PWA moderna** para gestionar todas tus garantías en un solo lugar. Nunca pierdas una garantía de nuevo con recordatorios inteligentes, OCR automático, y funcionalidad offline.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8)](https://web.dev/progressive-web-apps/)

---

## ✨ Features

### 🎯 Core Features

- 📱 **Progressive Web App (PWA)** - Instalable en cualquier dispositivo
- 📵 **Modo Offline Completo** - Funciona sin internet gracias a IndexedDB
- 🔍 **OCR Inteligente** - Escanea recibos y extrae información automáticamente
- 📊 **Analytics & Dashboard** - Visualiza estadísticas de tus garantías
- 🔔 **Notificaciones Push** - Recordatorios cuando una garantía está por vencer
- 📄 **Exportación a PDF** - Genera reportes profesionales
- 🔐 **Autenticación Segura** - JWT + bcrypt
- 🌙 **Dark Mode** - Tema oscuro/claro/automático
- 🌍 **Multi-idioma** - Preparado para ES/EN
- 🔍 **Búsqueda Avanzada** - Filtra por categoría, estado, y texto

### 🚀 Tech Highlights

- ⚡ **Ultra-rápido** - Vite + React 18 + SWC
- 🎨 **UI Moderna** - TailwindCSS + componentes personalizados
- 📦 **TypeScript** - Type-safe en frontend y backend
- 🗄️ **PostgreSQL** - Base de datos robusta y escalable
- 🐳 **Docker Ready** - Deploy en cualquier plataforma
- ☁️ **Railway Optimized** - Deploy automático con un click

---

## 🚀 Quick Start

### Requisitos Previos

- Node.js >= 20.0.0
- PostgreSQL 15+
- npm >= 10.0.0

### Instalación Local

```bash
# 1. Clonar repositorio
git clone https://github.com/portigueira55/warranty_wallet.git
cd warranty_wallet

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Editar .env con tu DATABASE_URL
npm run dev

# 3. Setup Frontend (en otra terminal)
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api
npm run dev
```

Accede a:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health

---

## 📦 Stack Tecnológico

### Frontend
- React 18.3 + TypeScript 5.7
- Vite 6.0 + TailwindCSS 3.4
- TanStack Query 5.62 + Zustand 5.0
- Dexie 4.0 (IndexedDB)
- Tesseract.js 5.1 (OCR)
- jsPDF 2.5 + Recharts 2.15

### Backend
- Node.js 20 + Express 4.21
- PostgreSQL 15 + TypeScript 5.7
- JWT + bcryptjs
- Multer + node-cron

---

## 📚 Documentación

- **[📖 Guía del Desarrollador](./DEVELOPER_GUIDE.md)** - Arquitectura completa
- **[🚀 Deploy en Railway](./RAILWAY_DEPLOY.md)** - Guía de producción

---

## 🚢 Deploy en Railway

1. Crear proyecto en [railway.app](https://railway.app)
2. Connect GitHub repo
3. Add PostgreSQL
4. Configurar `JWT_SECRET`
5. Deploy automático! 🎉

Ver: [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea tu feature branch
3. Commit con convención: `feat:`, `fix:`, `docs:`
4. Push y crea Pull Request

---

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE)

---

**¡Nunca pierdas una garantía de nuevo! 🔖**

Made with ❤️ and TypeScript
