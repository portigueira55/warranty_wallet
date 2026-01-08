# 🚀 Guía Completa: Deploy en VPS Hostinger

> Guía paso a paso para desplegar Warranty Wallet en un VPS de Hostinger **desde cero**.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Acceder a tu VPS](#paso-1-acceder-a-tu-vps)
3. [Paso 2: Configuración Inicial del Servidor](#paso-2-configuración-inicial-del-servidor)
4. [Paso 3: Instalar Software Necesario](#paso-3-instalar-software-necesario)
5. [Paso 4: Configurar PostgreSQL](#paso-4-configurar-postgresql)
6. [Paso 5: Subir el Proyecto al VPS](#paso-5-subir-el-proyecto-al-vps)
7. [Paso 6: Configurar la Aplicación](#paso-6-configurar-la-aplicación)
8. [Paso 7: Configurar Nginx (Servidor Web)](#paso-7-configurar-nginx-servidor-web)
9. [Paso 8: Configurar SSL (HTTPS)](#paso-8-configurar-ssl-https)
10. [Paso 9: Mantener la App Corriendo (PM2)](#paso-9-mantener-la-app-corriendo-pm2)
11. [Paso 10: Configurar Dominio](#paso-10-configurar-dominio)
12. [Solución de Problemas](#solución-de-problemas)

---

## 📋 Requisitos Previos

### Lo que necesitas tener:

- ✅ VPS de Hostinger contratado (cualquier plan funciona, recomendado mínimo 2GB RAM)
- ✅ Un dominio (ej: `tudominio.com`) - opcional pero recomendado
- ✅ Datos de acceso SSH a tu VPS (los recibes por email de Hostinger)
- ✅ Tu computadora (Windows, Mac o Linux)

### Software que necesitarás en tu computadora:

- **Windows**: [PuTTY](https://www.putty.org/) para conectarte por SSH
- **Mac/Linux**: Ya tienes Terminal integrado, no necesitas nada

---

## 🔐 Paso 1: Acceder a tu VPS

### 1.1 Obtener credenciales

Busca en tu email de Hostinger un correo con título similar a "VPS Details" que contiene:

```
IP del servidor: 123.45.67.89
Usuario: root
Contraseña: ************
Puerto SSH: 22
```

### 1.2 Conectarte por SSH

#### En Windows (con PuTTY):

1. Abre PuTTY
2. En "Host Name": pon la IP de tu VPS (ej: `123.45.67.89`)
3. En "Port": pon `22`
4. Click en "Open"
5. Te pedirá usuario: escribe `root` y presiona Enter
6. Te pedirá contraseña: pega la contraseña (no se verá al escribir, es normal)

#### En Mac/Linux (con Terminal):

```bash
ssh root@123.45.67.89
# Escribe 'yes' si te pregunta sobre fingerprint
# Luego pega tu contraseña cuando te la pida
```

✅ **Si ves algo como `root@vps-123456:~#` significa que estás dentro!**

---

## ⚙️ Paso 2: Configuración Inicial del Servidor

### 2.1 Actualizar el sistema

Copia y pega estos comandos **uno por uno**:

```bash
# Actualizar lista de paquetes
apt update

# Actualizar todos los paquetes instalados
apt upgrade -y
```

Esto tomará 2-5 minutos. ☕

### 2.2 Crear un usuario (más seguro que usar root)

```bash
# Crear usuario 'appuser'
adduser appuser

# Te pedirá una contraseña - elige una segura y GUÁRDALA
# Las demás preguntas (nombre completo, etc.) puedes darle Enter
```

```bash
# Darle permisos de administrador
usermod -aG sudo appuser

# Cambiar a ese usuario
su - appuser
```

✅ **Ahora deberías ver `appuser@vps-123456:~$`**

---

## 📦 Paso 3: Instalar Software Necesario

### 3.1 Instalar Node.js 20

```bash
# Descargar script de instalación de Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debería mostrar v20.x.x
npm --version   # Debería mostrar 10.x.x
```

### 3.2 Instalar Git

```bash
sudo apt install -y git

# Verificar
git --version
```

### 3.3 Instalar PostgreSQL 15

```bash
# Agregar repositorio oficial de PostgreSQL
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Importar clave GPG
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Actualizar e instalar
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Verificar que está corriendo
sudo systemctl status postgresql
# Presiona 'q' para salir
```

### 3.4 Instalar Nginx (Servidor Web)

```bash
sudo apt install -y nginx

# Verificar
sudo systemctl status nginx
# Presiona 'q' para salir
```

### 3.5 Instalar PM2 (Para mantener la app corriendo)

```bash
sudo npm install -g pm2

# Verificar
pm2 --version
```

---

## 🗄️ Paso 4: Configurar PostgreSQL

### 4.1 Crear base de datos y usuario

```bash
# Entrar a PostgreSQL como usuario postgres
sudo -u postgres psql
```

Ahora estás dentro de PostgreSQL. Verás `postgres=#`. Ejecuta esto:

```sql
-- Crear base de datos
CREATE DATABASE warranty_wallet;

-- Crear usuario con contraseña (CAMBIA 'tu_password_aqui')
CREATE USER warranty_user WITH PASSWORD 'tu_password_aqui';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE warranty_wallet TO warranty_user;

-- Salir
\q
```

### 4.2 Configurar acceso remoto (opcional pero útil)

```bash
# Editar configuración de PostgreSQL
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Busca la línea `#listen_addresses = 'localhost'` y cámbiala por:

```
listen_addresses = 'localhost'
```

Presiona `Ctrl+X`, luego `Y`, luego `Enter` para guardar.

```bash
# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

---

## 📤 Paso 5: Subir el Proyecto al VPS

### 5.1 Opción A: Desde GitHub (Recomendado)

**Si tu proyecto ya está en GitHub:**

```bash
# Ir a la carpeta home
cd ~

# Clonar el repositorio (CAMBIA la URL por la tuya)
git clone https://github.com/portigueira55/warranty_wallet.git

# Entrar a la carpeta
cd warranty_wallet
```

### 5.2 Opción B: Subir archivos manualmente

**Si no usas GitHub:**

Desde tu computadora local, usa SCP para subir:

#### Windows (con WinSCP):
1. Descarga [WinSCP](https://winscp.net/)
2. Conecta con IP, usuario `appuser`, contraseña
3. Arrastra la carpeta `warranty_wallet` a `/home/appuser/`

#### Mac/Linux:
```bash
# Desde tu computadora (NO desde el VPS)
scp -r /ruta/a/warranty_wallet appuser@123.45.67.89:/home/appuser/
```

---

## ⚙️ Paso 6: Configurar la Aplicación

### 6.1 Instalar dependencias del backend

```bash
cd ~/warranty_wallet/backend
npm install
```

### 6.2 Configurar variables de entorno

```bash
# Crear archivo .env
nano .env
```

Pega esto (CAMBIA los valores):

```env
# Base de datos
DATABASE_URL=postgresql://warranty_user:tu_password_aqui@localhost:5432/warranty_wallet

# JWT Secret (genera uno aleatorio)
JWT_SECRET=cambia_esto_por_algo_muy_secreto_y_largo_12345

# Entorno
NODE_ENV=production

# Puerto
PORT=3000
```

Presiona `Ctrl+X`, luego `Y`, luego `Enter`.

### 6.3 Compilar el backend

```bash
npm run build
```

### 6.4 Instalar dependencias del frontend

```bash
cd ~/warranty_wallet/frontend
npm install
```

### 6.5 Configurar frontend para producción

```bash
# Crear archivo .env
nano .env
```

Pega esto (CAMBIA `tudominio.com` por tu dominio real):

```env
VITE_API_URL=https://tudominio.com/api
```

Si aún no tienes dominio, usa la IP:

```env
VITE_API_URL=http://123.45.67.89/api
```

### 6.6 Compilar el frontend

```bash
npm run build
```

✅ **Deberías ver una carpeta `dist/` en `frontend/`**

---

## 🌐 Paso 7: Configurar Nginx (Servidor Web)

Nginx será el servidor web que recibe las peticiones y las envía a tu app.

### 7.1 Crear configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/warranty-wallet
```

Pega esto (CAMBIA `tudominio.com` por tu dominio real):

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Logs
    access_log /var/log/nginx/warranty-wallet.access.log;
    error_log /var/log/nginx/warranty-wallet.error.log;

    # Servir archivos estáticos del frontend
    root /home/appuser/warranty_wallet/frontend/dist;
    index index.html;

    # Tamaño máximo de archivos subidos (para fotos de recibos)
    client_max_body_size 10M;

    # Peticiones a la API -> Backend en puerto 3000
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Si NO tienes dominio aún**, usa tu IP:

```nginx
server {
    listen 80;
    server_name 123.45.67.89;  # <- Tu IP aquí

    # ... resto del archivo igual
}
```

Guarda: `Ctrl+X`, `Y`, `Enter`.

### 7.2 Activar la configuración

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/warranty-wallet /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Debería decir "syntax is ok" y "test is successful"
```

### 7.3 Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

---

## 🔒 Paso 8: Configurar SSL (HTTPS)

**Solo si tienes un dominio.** Si usas IP, salta al Paso 9.

### 8.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtener certificado SSL

```bash
# CAMBIA tudominio.com por tu dominio real
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Te hará unas preguntas:
- Email: pon tu email
- Términos: escribe `A` (aceptar)
- Redirect HTTP a HTTPS: escribe `2` (sí, redirigir)

✅ **Listo! Ahora tu sitio tiene HTTPS**

### 8.3 Auto-renovación

```bash
# Probar renovación
sudo certbot renew --dry-run

# Si funciona, está configurado para renovarse automáticamente
```

---

## 🚀 Paso 9: Mantener la App Corriendo (PM2)

PM2 mantendrá tu backend corriendo 24/7, incluso si se reinicia el servidor.

### 9.1 Iniciar el backend con PM2

```bash
cd ~/warranty_wallet/backend

# Iniciar la app
pm2 start dist/server.js --name warranty-wallet

# Ver estado
pm2 status
```

Deberías ver:

```
┌─────┬────────────────────┬─────────┬──────┐
│ id  │ name               │ status  │ cpu  │
├─────┼────────────────────┼─────────┼──────┤
│ 0   │ warranty-wallet    │ online  │ 0%   │
└─────┴────────────────────┴─────────┴──────┘
```

### 9.2 Configurar inicio automático

```bash
# Guardar lista de procesos
pm2 save

# Configurar para que inicie al arrancar el servidor
pm2 startup

# COPIA Y EJECUTA el comando que te muestra
# Será algo como: sudo env PATH=$PATH:/usr/bin pm2 startup...
```

### 9.3 Comandos útiles de PM2

```bash
# Ver logs en tiempo real
pm2 logs warranty-wallet

# Reiniciar la app
pm2 restart warranty-wallet

# Parar la app
pm2 stop warranty-wallet

# Ver uso de recursos
pm2 monit
```

---

## 🌍 Paso 10: Configurar Dominio

### 10.1 En el panel de tu proveedor de dominios

Necesitas crear un registro DNS tipo **A** apuntando a tu IP:

```
Tipo: A
Nombre: @
Valor: 123.45.67.89  (tu IP del VPS)
TTL: 3600
```

Si quieres `www.tudominio.com` también:

```
Tipo: A
Nombre: www
Valor: 123.45.67.89
TTL: 3600
```

**Propagación**: Puede tardar 5 minutos a 24 horas.

### 10.2 Verificar

```bash
# Desde tu computadora
ping tudominio.com

# Debería responder con tu IP: 123.45.67.89
```

---

## ✅ Verificación Final

### Probar que todo funciona:

1. **Abrir navegador** en `http://tudominio.com` (o `http://123.45.67.89`)
2. Deberías ver la página de login de Warranty Wallet
3. **Probar API**: `http://tudominio.com/api/health`
   - Debería devolver: `{"status":"ok","database":"connected"}`

### Verificar logs:

```bash
# Backend (PM2)
pm2 logs warranty-wallet

# Nginx
sudo tail -f /var/log/nginx/warranty-wallet.access.log
sudo tail -f /var/log/nginx/warranty-wallet.error.log

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

---

## 🔧 Solución de Problemas

### Problema 1: "502 Bad Gateway"

**Causa**: Backend no está corriendo.

```bash
# Verificar PM2
pm2 status

# Si no está corriendo:
cd ~/warranty_wallet/backend
pm2 start dist/server.js --name warranty-wallet
```

### Problema 2: "No se conecta a la base de datos"

```bash
# Probar conexión manual
psql -U warranty_user -d warranty_wallet -h localhost

# Si falla, revisar credenciales en .env
nano ~/warranty_wallet/backend/.env
```

### Problema 3: "La página no carga"

```bash
# Revisar Nginx
sudo systemctl status nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver errores
sudo tail -50 /var/log/nginx/error.log
```

### Problema 4: "Error al subir imágenes"

```bash
# Asegurarse que el directorio existe
mkdir -p ~/warranty_wallet/backend/uploads
chmod 755 ~/warranty_wallet/backend/uploads
```

### Problema 5: Frontend muestra API error

Verifica que `frontend/.env` tenga la URL correcta:

```bash
nano ~/warranty_wallet/frontend/.env
# VITE_API_URL debe ser https://tudominio.com/api
```

Si cambias algo, recompila:

```bash
cd ~/warranty_wallet/frontend
npm run build
```

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
# Ir al proyecto
cd ~/warranty_wallet

# Traer cambios de GitHub
git pull origin main

# Backend
cd backend
npm install        # Si hay nuevas dependencias
npm run build
pm2 restart warranty-wallet

# Frontend
cd ../frontend
npm install        # Si hay nuevas dependencias
npm run build

# No necesitas reiniciar Nginx, Nginx sirve los archivos estáticos
```

---

## 📊 Monitoreo y Mantenimiento

### Ver uso de recursos:

```bash
# CPU y RAM
htop

# Espacio en disco
df -h

# PM2 monitoring
pm2 monit
```

### Backup de base de datos:

```bash
# Crear backup
pg_dump -U warranty_user -d warranty_wallet > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U warranty_user -d warranty_wallet < backup_20260107.sql
```

---

## 🎉 ¡Listo!

Tu Warranty Wallet ahora está corriendo en producción en tu VPS de Hostinger.

### URLs importantes:

- **App Frontend**: https://tudominio.com (o http://IP)
- **API Health**: https://tudominio.com/api/health
- **API Base**: https://tudominio.com/api

### Archivos importantes:

- Backend: `/home/appuser/warranty_wallet/backend/`
- Frontend: `/home/appuser/warranty_wallet/frontend/dist/`
- Config Nginx: `/etc/nginx/sites-available/warranty-wallet`
- Logs: `/var/log/nginx/`

---

**¿Tienes dudas?** Revisa la sección de Solución de Problemas o los logs con:

```bash
pm2 logs warranty-wallet
sudo tail -f /var/log/nginx/error.log
```

**¡Nunca pierdas una garantía de nuevo! 🔖**
