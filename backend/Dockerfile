# Multi-stage Dockerfile para Warranty Wallet (Frontend PWA + Backend)
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar frontend package files
COPY frontend/package*.json ./

# Instalar dependencias del frontend
RUN npm ci

# Copiar código del frontend
COPY frontend/ ./

# Build frontend PWA
RUN npm run build

# Backend builder stage
FROM node:20-alpine AS backend-builder

# Instalar dependencias de compilación
RUN apk add --no-cache python3 make g++

WORKDIR /app/backend

# Copiar backend package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Instalar dependencias del backend
RUN npm ci

# Copiar código del backend
COPY backend/src ./src

# Compilar TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copiar package.json del backend
COPY backend/package*.json ./

# Instalar solo dependencias de producción del backend
RUN npm ci --only=production

# Copiar backend compilado
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/src/public ./dist/public

# Copiar frontend compilado (PWA)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Crear directorio para uploads
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "dist/server.js"]
