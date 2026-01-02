# Dockerfile para Warranty Wallet Backend
FROM node:20-alpine AS builder

# Instalar dependencias de compilación
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Copiar package.json para producción
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/public ./dist/public

# Crear directorio para uploads
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["node", "dist/server.js"]
