# ⚡ Setup Rápido VPS - Versión Simplificada

> Para cuando quieres ir directo al grano sin leer 500 líneas 😉

---

## 🎯 Opción SUPER FÁCIL - Script Automático

### 1. Conecta al VPS

```bash
ssh root@TU_IP_DEL_VPS
# Pon tu contraseña
```

### 2. Instala lo básico (copia TODO de una vez)

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar PostgreSQL 15
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-15

# Instalar Nginx y PM2
apt install -y nginx git
npm install -g pm2

# Verificar
node --version  # Debe mostrar v20.x
psql --version  # Debe mostrar 15.x
```

### 3. Clonar proyecto

```bash
cd /root
git clone https://github.com/portigueira55/warranty_wallet.git
cd warranty_wallet/backend
```

### 4. Configurar base de datos

**IMPORTANTE**: Primero cambia la contraseña en el archivo SQL:

```bash
nano init-database.sql
```

Busca esta línea:
```sql
CREATE USER warranty_user WITH PASSWORD 'tu_password_segura_aqui';
```

Cámbiala por (ejemplo):
```sql
CREATE USER warranty_user WITH PASSWORD 'MiPassword123!';
```

**GUARDA LA PASSWORD** que pongas aquí, la necesitarás después.

Guarda: `Ctrl+X`, luego `Y`, luego `Enter`

Ahora ejecuta el script:

```bash
sudo -u postgres psql -f init-database.sql
```

### 5. Configurar .env del backend

```bash
nano .env
```

Pega esto (CAMBIA los valores):

```env
# Base de datos - USA LA MISMA PASSWORD DEL PASO 4
DATABASE_URL=postgresql://warranty_user:MiPassword123!@localhost:5432/warranty_wallet

# JWT Secret - invéntate algo largo y aleatorio
JWT_SECRET=super-secreto-aleatorio-12345-warranty-wallet-2024

# Entorno
NODE_ENV=production
PORT=3000
```

Guarda: `Ctrl+X`, `Y`, `Enter`

### 6. Instalar y compilar backend

```bash
npm install
npm run build
```

### 7. Configurar frontend

```bash
cd ../frontend
nano .env
```

Pega esto (CAMBIA `tudominio.com` por tu dominio real, o usa tu IP):

```env
VITE_API_URL=https://tudominio.com/api
```

O si no tienes dominio:
```env
VITE_API_URL=http://TU_IP_AQUI/api
```

### 8. Instalar y compilar frontend

```bash
npm install
npm run build
```

### 9. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/warranty-wallet
```

Pega esto (CAMBIA `tudominio.com` por tu dominio o IP):

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;  # O tu IP: 123.45.67.89

    root /root/warranty_wallet/frontend/dist;
    index index.html;

    client_max_body_size 10M;

    # API -> Backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 10. Activar Nginx

```bash
sudo ln -s /etc/nginx/sites-available/warranty-wallet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 11. Arrancar backend con PM2

```bash
cd /root/warranty_wallet/backend
pm2 start dist/server.js --name warranty-wallet
pm2 save
pm2 startup
# Copia y ejecuta el comando que te muestra
```

### 12. (OPCIONAL) SSL/HTTPS - Solo si tienes dominio

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d tudominio.com -d www.tudominio.com
# Sigue las instrucciones (pon tu email, acepta términos)
```

---

## ✅ PROBAR

Abre navegador:

- **Frontend**: http://tudominio.com (o http://TU_IP)
- **API Health**: http://tudominio.com/api/health

Deberías ver la app funcionando! 🎉

---

## 🔧 Comandos Útiles

```bash
# Ver logs del backend
pm2 logs warranty-wallet

# Reiniciar backend
pm2 restart warranty-wallet

# Ver estado
pm2 status

# Logs de Nginx
tail -f /var/log/nginx/error.log

# Ver base de datos
sudo -u postgres psql warranty_wallet
\dt  # Ver tablas
\q   # Salir
```

---

## ❌ Problemas Comunes

### "502 Bad Gateway"
```bash
pm2 restart warranty-wallet
pm2 logs warranty-wallet
```

### "Can't connect to database"
```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Probar conexión manual
psql -U warranty_user -d warranty_wallet -h localhost
# Pon la password que configuraste
```

### "Permission denied" al acceder archivos
```bash
chmod -R 755 /root/warranty_wallet/frontend/dist
```

---

## 🔄 Actualizar la App

Cuando hagas cambios en GitHub:

```bash
cd /root/warranty_wallet
git pull

# Backend
cd backend
npm install
npm run build
pm2 restart warranty-wallet

# Frontend
cd ../frontend
npm install
npm run build
# Nginx lo servirá automáticamente
```

---

**¿Necesitas la guía completa detallada?** 👉 [HOSTINGER_VPS_DEPLOY.md](./HOSTINGER_VPS_DEPLOY.md)
