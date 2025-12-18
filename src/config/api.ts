/**
 * Configuración de la API Backend
 *
 * Cambia API_URL según tu entorno:
 * - Desarrollo local: http://localhost:3000
 * - Codespaces: https://tu-codespace-url.app.github.dev
 * - Producción: https://api.warrantywallet.com
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Determina la URL base de la API según el entorno
 */
const getApiUrl = (): string => {
  // Si estás en desarrollo y quieres conectar al backend local
  if (__DEV__) {
    // Android Emulator usa 10.0.2.2 para acceder a localhost de la máquina host
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }

    // iOS Simulator y web pueden usar localhost directamente
    return 'http://localhost:3000';
  }

  // En producción, usar la URL de producción
  return 'https://api.warrantywallet.com';
};

export const API_URL = getApiUrl();

/**
 * Endpoints de la API
 */
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    MANUFACTURER_LOGIN: '/api/auth/manufacturer/login',
    ADMIN_LOGIN: '/api/auth/admin/login',
  },

  // Usuario
  USER: {
    PROFILE: '/api/user/profile',
    WARRANTIES: '/api/user/warranties',
    WARRANTY_BY_ID: (id: string) => `/api/user/warranties/${id}`,
    CREATE_CLAIM: (id: string) => `/api/user/warranties/${id}/claim`,
    NOTIFICATIONS: '/api/user/notifications',
  },

  // Fabricante
  MANUFACTURER: {
    DASHBOARD: '/api/manufacturer/dashboard',
    PRODUCTS: '/api/manufacturer/products',
    CLAIMS: '/api/manufacturer/claims',
    CLAIM_BY_ID: (id: string) => `/api/manufacturer/claims/${id}`,
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

  // Health check
  HEALTH: '/health',
};

/**
 * Timeout por defecto para las peticiones (10 segundos)
 */
export const API_TIMEOUT = 10000;

/**
 * Headers por defecto
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
