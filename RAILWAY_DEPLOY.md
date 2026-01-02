# 🚀 Despliegue en Railway - Warranty Wallet Backend

Este documento explica cómo desplegar el backend de Warranty Wallet en Railway de forma automática.

## 📋 Requisitos Previos

- Cuenta en [Railway](https://railway.app/)
- Cuenta de GitHub (para conectar el repositorio)
- Este proyecto usa PostgreSQL (Railway lo provee gratis)

## 🎯 Pasos para Desplegar

### 1️⃣ Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app/) y haz login
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway para acceder a tu GitHub
5. Selecciona el repositorio `warranty_wallet`

### 2️⃣ Agregar PostgreSQL

1. En tu proyecto de Railway, click en "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway creará automáticamente la base de datos
4. La variable `DATABASE_URL` se inyectará automáticamente

### 3️⃣ Configurar Variables de Entorno

En Railway, ve a tu servicio → "Variables" y agrega:

```bash
NODE_ENV=production
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=7d
PORT=3000
```

**IMPORTANTE:** Railway ya provee `DATABASE_URL` automáticamente cuando agregas PostgreSQL.

### 4️⃣ Configurar el Build

Railway detectará automáticamente el `railway.toml` y `Dockerfile`.

**Si necesitas configurar manualmente:**

1. Ve a "Settings" de tu servicio
2. En "Build Command": `cd backend && npm install && npm run build`
3. En "Start Command": `cd backend && npm run start`
4. Root Directory: `/` (raíz del proyecto)

### 5️⃣ Deploy Automático

1. Railway comenzará el deploy automáticamente
2. Espera a que termine (verás los logs en tiempo real)
3. Una vez completado, Railway te dará una URL pública

### 6️⃣ Verificar el Deploy

Accede a tu URL (ej: `https://tu-proyecto.up.railway.app`)

Deberías ver:

```json
{
  "message": "Warranty Wallet API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "warranties": "/api/warranties",
    "notifications": "/api/notifications",
    "transfer": "/api/transfer",
    "admin": "/admin"
  }
}
```

## 🔄 Deploys Automáticos

Railway se conecta a tu repositorio de GitHub:

- Cada `git push` a tu rama principal → deploy automático
- Los logs están en Railway Dashboard
- Rollback disponible en la interfaz

## 🗄️ Base de Datos

### Características de PostgreSQL en Railway:

- ✅ **Gratis**: 500MB de almacenamiento
- ✅ **Backups automáticos**
- ✅ **SSL habilitado por defecto**
- ✅ **Alta disponibilidad**

### Conectarse a la Base de Datos:

```bash
# Railway provee estos datos en el dashboard:
# - Host
# - Port
# - User
# - Password
# - Database

# O usa la URL completa (disponible en Variables)
psql $DATABASE_URL
```

## 📊 Monitoreo

En Railway Dashboard puedes ver:

- **Logs en tiempo real**
- **Métricas de uso** (CPU, RAM, Network)
- **Historial de deploys**
- **Variables de entorno**

## 🛠️ Troubleshooting

### Error: "Build failed"

1. Revisa los logs en Railway
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate que `typescript` compile sin errores

### Error: "Database connection failed"

1. Verifica que PostgreSQL esté agregado al proyecto
2. Chequea que `DATABASE_URL` exista en Variables
3. Revisa los logs para ver el error específico

### Error: "Port already in use"

Railway maneja el puerto automáticamente. Asegúrate que tu código use:

```typescript
const PORT = process.env.PORT || 3000;
```

## 🔐 Seguridad

### ⚠️ Cambiar en Producción:

1. **JWT_SECRET**: Genera un secreto único
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Variables sensibles**: Nunca las subas a GitHub
3. **CORS**: Configura origins específicos en producción

## 📱 Conectar el App Móvil

Una vez desplegado, actualiza tu app Expo:

```typescript
// config.ts o similar
const API_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://tu-proyecto.up.railway.app';
```

## 💰 Costos

Railway ofrece:

- **Gratis**: $5 USD de crédito mensual
- Suficiente para desarrollo y pruebas
- Plan Pro: $20 USD/mes para producción

## 📚 Recursos

- [Railway Docs](https://docs.railway.app/)
- [PostgreSQL en Railway](https://docs.railway.app/databases/postgresql)
- [Troubleshooting](https://docs.railway.app/troubleshoot/fixing-common-errors)

## ✅ Checklist de Deploy

- [ ] Proyecto creado en Railway
- [ ] PostgreSQL agregado
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] URL pública funcionando
- [ ] Base de datos inicializada
- [ ] App móvil conectada al backend

---

**¡Listo!** Tu backend está en producción y se actualizará automáticamente con cada push a GitHub.
