# 🎛️ Warranty Wallet - Panel de Administración

Panel web de administración para gestionar usuarios, fabricantes y garantías del sistema Warranty Wallet.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` y configura la URL del backend:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

El panel estará disponible en http://localhost:5173

## 🔑 Credenciales de Prueba

| Tipo | Email | Password |
|------|-------|----------|
| Super Admin | admin@warrantywallet.com | password123 |

## 🛠️ Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **TailwindCSS** - Estilos utility-first
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos
- **Recharts** - Gráficos (opcional)

## 📁 Estructura del Proyecto

```
admin-panel/
├── src/
│   ├── config/          # Configuración (API, etc.)
│   ├── services/        # Servicios (API client, auth)
│   ├── context/         # React Context (AuthContext)
│   ├── pages/           # Páginas principales
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── UsersPage.tsx
│   │   └── ManufacturersPage.tsx
│   ├── components/      # Componentes reutilizables
│   │   └── Layout.tsx
│   ├── hooks/           # Custom hooks
│   ├── types/           # Tipos TypeScript
│   ├── App.tsx          # App principal con routing
│   ├── main.tsx         # Punto de entrada
│   └── index.css        # Estilos globales + Tailwind
├── .env.example         # Ejemplo de variables de entorno
├── tailwind.config.js   # Configuración Tailwind
├── vite.config.ts       # Configuración Vite
└── package.json
```

## ✨ Características

### ✅ Implementadas

- 🔐 Sistema de autenticación con JWT
- 📊 Dashboard con estadísticas generales
- 👥 Gestión de usuarios (listar, activar/desactivar)
- 🏭 Gestión de fabricantes (listar, ver detalles)
- 🎨 Interfaz moderna con TailwindCSS
- 📱 Diseño responsive (mobile, tablet, desktop)
- 🔄 Rutas protegidas con React Router
- ⚡ Estado global con Context API

### 🚧 Por Implementar

- ➕ Crear nuevos fabricantes
- ✏️ Editar fabricantes existentes
- 📈 Gráficos de estadísticas (Recharts)
- 📋 Gestión de garantías (listar todas)
- 🎫 Gestión de reclamaciones
- 🔍 Filtros avanzados y búsqueda
- 📄 Exportación de datos (CSV, PDF)
- 📧 Notificaciones en tiempo real

## 🖥️ Comandos Disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar para producción
npm run preview      # Vista previa de producción
npm run lint         # Ejecutar ESLint
```

## 🔗 Integración con Backend

El panel se conecta al backend Node.js + Express mediante la API REST.

**Endpoints utilizados:**
- `POST /api/auth/admin/login` - Login de administrador
- `GET /api/admin/dashboard` - Estadísticas generales
- `GET /api/admin/users` - Listar usuarios
- `PUT /api/admin/users/:id/status` - Activar/desactivar usuario
- `GET /api/admin/manufacturers` - Listar fabricantes
- `GET /api/admin/warranties` - Listar garantías

Ver documentación completa del backend en `../backend/README.md`

## 🎨 Personalización

### Cambiar colores del tema

Edita `tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#1a73e8',    // Azul principal
        secondary: '#10b981',  // Verde secundario
      },
    },
  },
}
```

### Agregar nuevas páginas

1. Crear componente en `src/pages/`
2. Agregar ruta en `src/App.tsx`
3. Agregar enlace en `src/components/Layout.tsx`

## 🐛 Solución de Problemas

**Error: Cannot connect to backend**
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Verifica la variable `VITE_API_URL` en `.env`

**Error 401 Unauthorized**
- El token JWT expiró o es inválido
- Cierra sesión e inicia sesión nuevamente

**Estilos no se aplican**
- Asegúrate de que TailwindCSS esté correctamente configurado
- Verifica que `@tailwind` directives estén en `src/index.css`

## 📚 Recursos

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)

## 📄 Licencia

MIT

---

**Proyecto:** Warranty Wallet
**Última actualización:** 18 de diciembre de 2025
