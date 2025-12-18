/**
 * Configuración de la API Backend para Panel de Administración
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
};

export const API_ENDPOINTS = {
  // Autenticación Admin
  AUTH: {
    LOGIN: '/api/auth/admin/login',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: '/api/admin/users',
    USER_STATUS: (id: string) => `/api/admin/users/${id}/status`,
    MANUFACTURERS: '/api/admin/manufacturers',
    MANUFACTURER_BY_ID: (id: string) => `/api/admin/manufacturers/${id}`,
    WARRANTIES: '/api/admin/warranties',
  },

  // Health
  HEALTH: '/health',
};
