/**
 * Servicio de autenticación para administradores
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

interface LoginResponse {
  success: boolean;
  data?: {
    user: Admin;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

export class AuthService {
  static async login(email: string, password: string): Promise<Admin | null> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );

      if (response.success && response.data) {
        const { user, accessToken } = response.data;
        apiClient.saveToken(accessToken);
        return user;
      }

      return null;
    } catch (error: any) {
      console.error('Error en login:', error);
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  static logout(): void {
    apiClient.clearToken();
  }

  static isAuthenticated(): boolean {
    return apiClient.hasToken();
  }
}
