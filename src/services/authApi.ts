/**
 * Servicio de Autenticación con Backend Real
 *
 * Este servicio se conecta al backend Node.js + Express para autenticación JWT
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_USER_KEY = 'ww_current_user';

/**
 * Tipos de respuesta de la API de autenticación
 */
interface LoginResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      username?: string;
      name?: string;
      role: 'user' | 'manufacturer' | 'admin';
    };
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      username: string;
      name?: string;
      role: 'user';
    };
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

/**
 * Servicio de autenticación con backend real
 */
export class AuthApiService {
  /**
   * Login de usuario
   */
  static async login(email: string, password: string): Promise<User | null> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        // Guardar tokens
        await apiClient.saveTokens(accessToken, refreshToken);

        // Convertir formato del backend al formato de la app
        const appUser: User = {
          id: user.id,
          username: user.username || user.email.split('@')[0],
          name: user.name || user.username || 'Usuario',
          email: user.email,
          role: user.role === 'user' ? 'user' : 'admin',
          tenantId: user.id, // Usar ID como tenantId
          createdAt: new Date().toISOString(),
        };

        // Guardar usuario actual
        await this.saveCurrentUser(appUser);

        return appUser;
      }

      return null;
    } catch (error: any) {
      console.error('Error en login:', error.message || error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  /**
   * Registro de nuevo usuario
   */
  static async register(
    username: string,
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        { username, email, password }
      );

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        // Guardar tokens
        await apiClient.saveTokens(accessToken, refreshToken);

        // Convertir formato del backend al formato de la app
        const appUser: User = {
          id: user.id,
          username: user.username,
          name: user.name || user.username,
          email: user.email,
          role: 'user',
          tenantId: user.id,
          createdAt: new Date().toISOString(),
        };

        // Guardar usuario actual
        await this.saveCurrentUser(appUser);

        return appUser;
      }

      return null;
    } catch (error: any) {
      console.error('Error en registro:', error.message || error);
      throw new Error(error.message || 'Error al registrar usuario');
    }
  }

  /**
   * Logout de usuario
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.clearTokens();
      await this.clearCurrentUser();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  /**
   * Verifica si hay sesión activa
   */
  static async checkSession(): Promise<User | null> {
    try {
      // Verificar si hay token válido
      if (!apiClient.hasValidSession()) {
        return null;
      }

      // Obtener usuario guardado localmente
      const user = await this.getCurrentUser();

      if (user) {
        // Opcionalmente: verificar con el backend que el token sigue válido
        // Por ahora retornamos el usuario guardado
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error verificando sesión:', error);
      return null;
    }
  }

  /**
   * Obtiene el perfil del usuario desde el backend
   */
  static async getProfile(): Promise<User | null> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.USER.PROFILE);

      if (response.success && response.data) {
        const user = response.data;

        const appUser: User = {
          id: user.id,
          username: user.username || user.email.split('@')[0],
          name: user.name || user.username || 'Usuario',
          email: user.email,
          role: user.role === 'user' ? 'user' : 'admin',
          tenantId: user.id,
          createdAt: user.createdAt || new Date().toISOString(),
        };

        await this.saveCurrentUser(appUser);
        return appUser;
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  static async updateProfile(data: {
    name?: string;
    username?: string;
    phone?: string;
  }): Promise<boolean> {
    try {
      const response = await apiClient.put<any>(
        API_ENDPOINTS.USER.PROFILE,
        data
      );

      if (response.success) {
        // Actualizar usuario local
        const currentUser = await this.getCurrentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: data.name || currentUser.name,
            username: data.username || currentUser.username,
          };
          await this.saveCurrentUser(updatedUser);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return false;
    }
  }

  /**
   * Guarda el usuario actual en AsyncStorage
   */
  private static async saveCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error guardando usuario actual:', error);
    }
  }

  /**
   * Obtiene el usuario actual de AsyncStorage
   */
  private static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  /**
   * Limpia el usuario actual
   */
  private static async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error limpiando usuario actual:', error);
    }
  }
}
