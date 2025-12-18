# 🧪 Guía de Testing - Warranty Wallet

Guía completa para probar todas las funcionalidades implementadas en las 3 opciones.

---

## 🚀 Preparación del Entorno

### 1. Iniciar el Backend

```bash
cd backend
npm run dev
```

**Verificar que está corriendo:**
```bash
curl http://localhost:3000/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2025-12-18T...",
  "environment": "development"
}
```

### 2. Iniciar el Panel Web (opcional)

```bash
cd admin-panel
npm run dev
```

Panel disponible en: http://localhost:5173

### 3. Iniciar la App Móvil (opcional)

```bash
npx expo start
```

Escanea el QR con Expo Go o presiona:
- `a` para Android emulator
- `i` para iOS simulator
- `w` para web

---

## ✅ TEST 1: Backend API

### 1.1 Health Check
```bash
curl http://localhost:3000/health
```
✅ Debe retornar `{"status":"ok"}`

### 1.2 Login de Administrador
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@warrantywallet.com",
    "password": "password123"
  }'
```

✅ Debe retornar:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Guarda el `accessToken` para los siguientes tests.**

### 1.3 Dashboard de Admin
```bash
export TOKEN="tu_token_aqui"

curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

✅ Debe retornar estadísticas:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1,
    "totalManufacturers": 3,
    "totalWarranties": 1,
    "activeClaims": 0
  }
}
```

### 1.4 Listar Usuarios
```bash
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

✅ Debe retornar lista de usuarios incluyendo `demo@warrantywallet.com`

### 1.5 Listar Fabricantes
```bash
curl http://localhost:3000/api/admin/manufacturers \
  -H "Authorization: Bearer $TOKEN"
```

✅ Debe retornar Samsung, LG y Bosch

---

## ✅ TEST 2: Panel Web de Administración

### 2.1 Acceso al Panel
1. Abrir http://localhost:5173
2. ✅ Debe mostrar la pantalla de login

### 2.2 Login Incorrecto
1. Ingresar email: `test@test.com`
2. Ingresar password: `wrong`
3. Click en "Iniciar Sesión"
4. ✅ Debe mostrar error: "Email o contraseña incorrectos"

### 2.3 Login Correcto
1. Ingresar email: `admin@warrantywallet.com`
2. Ingresar password: `password123`
3. Click en "Iniciar Sesión"
4. ✅ Debe redirigir al Dashboard

### 2.4 Dashboard
1. ✅ Debe mostrar 4 tarjetas de estadísticas:
   - Usuarios Totales: 1
   - Fabricantes: 3
   - Garantías: 1
   - Reclamaciones Activas: 0

### 2.5 Navegación - Usuarios
1. Click en "Usuarios" en el sidebar
2. ✅ Debe mostrar tabla con el usuario demo
3. ✅ Debe tener botón "Desactivar" (verde si está activo)

### 2.6 Búsqueda de Usuarios
1. En la barra de búsqueda, escribir "demo"
2. ✅ Debe filtrar y mostrar solo el usuario demo
3. Borrar el texto
4. ✅ Debe mostrar todos los usuarios nuevamente

### 2.7 Activar/Desactivar Usuario
1. Click en botón "Desactivar" del usuario demo
2. ✅ El estado debe cambiar a "Inactivo" (rojo)
3. ✅ El botón debe cambiar a "Activar" (verde)
4. Click en "Activar" para volver al estado original

### 2.8 Navegación - Fabricantes
1. Click en "Fabricantes" en el sidebar
2. ✅ Debe mostrar 3 tarjetas de fabricantes:
   - Samsung
   - LG
   - Bosch
3. ✅ Cada tarjeta debe mostrar email y estado

### 2.9 Búsqueda de Fabricantes
1. En la barra de búsqueda, escribir "samsung"
2. ✅ Debe filtrar y mostrar solo Samsung
3. Borrar el texto
4. ✅ Debe mostrar todos los fabricantes

### 2.10 Logout
1. Scroll down en el sidebar
2. Click en "Cerrar Sesión"
3. ✅ Debe redirigir a la pantalla de login
4. ✅ Al intentar acceder a /dashboard directamente, debe redirigir a /login

---

## ✅ TEST 3: App Móvil

### 3.1 Pantalla de Login
1. Abrir la app
2. ✅ Debe mostrar la pantalla de login (no auto-login)

### 3.2 Login con Backend Real
1. Ingresar email: `demo@warrantywallet.com`
2. Ingresar password: `password123`
3. Click en "Iniciar Sesión"
4. ✅ Debe mostrar loading
5. ✅ Debe redirigir al Dashboard si el backend está corriendo
6. ✅ Si el backend NO está corriendo, debe mostrar error de conexión

### 3.3 Registro de Nuevo Usuario
1. En login, click en el botón de "Registrarse"
2. Ingresar username: `testuser`
3. Ingresar email: `test@example.com`
4. Ingresar password: `test1234`
5. Click en "Registrar"
6. ✅ Debe crear la cuenta y redirigir al Dashboard

### 3.4 Verificar Garantías
1. En el Dashboard
2. ✅ Debe mostrar la garantía de ejemplo si está logueado como demo
3. ✅ Para usuario nuevo, debe mostrar pantalla vacía

---

## ✅ TEST 4: OCR Real (Backend)

### 4.1 Preparar Imagen de Prueba
Necesitas una imagen de un ticket. Puedes usar cualquier ticket de compra o crear uno de prueba.

### 4.2 Login de Usuario
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@warrantywallet.com",
    "password": "password123"
  }'
```

**Guarda el token:**
```bash
export USER_TOKEN="tu_token_de_usuario_aqui"
```

### 4.3 Procesar Ticket con OCR
```bash
curl -X POST http://localhost:3000/api/ocr/process \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "image=@/ruta/a/tu/ticket.jpg"
```

✅ Debe retornar:
```json
{
  "success": true,
  "data": {
    "store": "MediaMarkt",
    "date": "2024-12-15",
    "total": 299.99,
    "items": ["Smartphone Samsung Galaxy", "Funda protectora"],
    "raw": "texto completo extraído..."
  },
  "message": "Imagen procesada exitosamente"
}
```

### 4.4 Extraer Solo Texto
```bash
curl -X POST http://localhost:3000/api/ocr/extract-text \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "image=@/ruta/a/tu/ticket.jpg"
```

✅ Debe retornar el texto completo del ticket

---

## ✅ TEST 5: Integración Completa

### 5.1 Flujo Completo de Garantía
1. **Login en la app móvil** con `demo@warrantywallet.com`
2. **Capturar foto** de un ticket (o seleccionar de galería)
3. **Procesar con OCR** (debe llamar al backend)
4. **Verificar datos extraídos** en el formulario
5. **Completar datos faltantes** manualmente
6. **Guardar garantía**
7. **Verificar en el backend** que se guardó:
```bash
curl http://localhost:3000/api/user/warranties \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 5.2 Verificar en Panel Web
1. **Login en el panel web** como admin
2. **Ir a Dashboard**
3. ✅ El contador de garantías debe haber aumentado
4. **Ir a Usuarios**
5. ✅ El usuario demo debe aparecer

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
npm run dev
```

### Panel web no compila
```bash
cd admin-panel
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### App móvil no conecta al backend
1. Verificar que `API_URL` en `src/config/api.ts` sea correcta:
   - Android Emulator: `http://10.0.2.2:3000`
   - iOS Simulator: `http://localhost:3000`
   - Dispositivo físico: `http://TU_IP_LOCAL:3000`

2. Verificar que el backend esté corriendo
3. En Android, verificar permisos de red

### OCR no funciona
1. Verificar que la imagen sea válida (JPG/PNG, < 5MB)
2. Verificar que el token JWT sea válido
3. Revisar logs del backend para ver errores de Tesseract

### Error 401 Unauthorized
- El token expiró (24 horas de validez)
- Hacer login nuevamente para obtener nuevo token

---

## ✅ Checklist Final

- [ ] Backend iniciado y respondiendo en `/health`
- [ ] Login de admin funcionando
- [ ] Dashboard mostrando estadísticas correctas
- [ ] Panel web iniciado en localhost:5173
- [ ] Login en panel web funcionando
- [ ] Navegación entre páginas del panel
- [ ] CRUD de usuarios funcionando
- [ ] Listado de fabricantes funcionando
- [ ] App móvil conectándose al backend
- [ ] Login en app móvil funcionando
- [ ] OCR procesando imágenes correctamente
- [ ] Datos extraídos del OCR son correctos

---

## 📊 Métricas de Éxito

### Backend
- ✅ 40+ endpoints funcionando
- ✅ 100% de endpoints autenticados
- ✅ Rate limiting activo
- ✅ CORS configurado correctamente
- ✅ Logs claros y descriptivos

### Panel Web
- ✅ Tiempo de carga < 2 segundos
- ✅ Sin errores en consola
- ✅ Responsive en mobile, tablet, desktop
- ✅ Autenticación persistente

### App Móvil
- ✅ Login < 3 segundos
- ✅ OCR procesamiento < 10 segundos
- ✅ Sin crashes en flujo principal
- ✅ Manejo de errores visible al usuario

---

**Fecha de creación:** 18 de diciembre de 2025
**Versión:** 1.0
**Estado:** ✅ Completo
