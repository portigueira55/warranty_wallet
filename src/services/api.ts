/**
 * Cliente API para comunicación con el backend
 *
 * Este archivo centraliza todas las peticiones HTTP al backend usando axios.
 * Maneja autenticación JWT, interceptores, y manejo de errores.
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, API_TIMEOUT, DEFAULT_HEADERS } from '../config/api';

/**
 * Keys para almacenamiento seguro de tokens
 */
const TOKEN_KEY = 'ww_access_token';
const REFRESH_TOKEN_KEY = 'ww_refresh_token';

/**
 * Tipos de respuesta de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Clase cliente API con axios
 */
class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Crear instancia de axios
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: DEFAULT_HEADERS,
    });

    // Inicializar tokens desde storage
    this.initializeTokens();

    // Interceptor para agregar token a las peticiones
    this.client.interceptors.request.use(
      async (config) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores de respuesta
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Si es error 401 (no autorizado), limpiar tokens
        if (error.response?.status === 401) {
          await this.clearTokens();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Inicializa tokens desde SecureStore
   */
  private async initializeTokens(): Promise<void> {
    try {
      this.accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
      this.refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error inicializando tokens:', error);
    }
  }

  /**
   * Guarda tokens en SecureStore
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error guardando tokens:', error);
      throw error;
    }
  }

  /**
   * Limpia tokens (logout)
   */
  async clearTokens(): Promise<void> {
    try {
      this.accessToken = null;
      this.refreshToken = null;
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error limpiando tokens:', error);
    }
  }

  /**
   * Obtiene el access token actual
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Verifica si hay una sesión activa
   */
  hasValidSession(): boolean {
    return !!this.accessToken;
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload de archivos con FormData
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Maneja errores de la API
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;

      // Error de red
      if (!axiosError.response) {
        return new Error('Error de conexión. Verifica tu internet.');
      }

      // Error del servidor
      const { status, data } = axiosError.response;

      switch (status) {
        case 400:
          return new Error(data?.message || 'Datos inválidos');
        case 401:
          return new Error('No autorizado. Inicia sesión nuevamente.');
        case 403:
          return new Error('No tienes permisos para esta acción');
        case 404:
          return new Error('Recurso no encontrado');
        case 500:
          return new Error('Error del servidor. Intenta más tarde.');
        default:
          return new Error(data?.message || 'Error desconocido');
      }
    }

    return error instanceof Error ? error : new Error('Error desconocido');
  }
}

/**
 * Instancia singleton del cliente API
 */
export const apiClient = new ApiClient();
