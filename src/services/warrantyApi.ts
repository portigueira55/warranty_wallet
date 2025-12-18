/**
 * Servicio de Garantías con Backend Real
 *
 * Este servicio maneja todas las operaciones relacionadas con garantías
 * conectándose al backend Node.js + Express
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import { Warranty, WarrantyClaim } from '../types';

/**
 * Tipos de respuesta de la API de garantías
 */
interface WarrantiesResponse {
  success: boolean;
  data?: any[];
  message?: string;
}

interface WarrantyResponse {
  success: boolean;
  data?: any;
  message?: string;
}

interface CreateWarrantyData {
  productName: string;
  category: string;
  store: string;
  purchaseDate: string;
  price: number;
  warrantyMonths: number;
  serialNumber?: string;
  model?: string;
  brand?: string;
  receiptPhoto?: string;
  productPhoto?: string;
  notes?: string;
}

interface CreateClaimData {
  description: string;
  issueType: string;
  preferredResolution: string;
  photos?: string[];
  videos?: string[];
}

/**
 * Servicio de garantías con backend real
 */
export class WarrantyApiService {
  /**
   * Obtiene todas las garantías del usuario
   */
  static async getWarranties(): Promise<Warranty[]> {
    try {
      const response = await apiClient.get<WarrantiesResponse>(
        API_ENDPOINTS.USER.WARRANTIES
      );

      if (response.success && response.data) {
        // Convertir formato del backend al formato de la app
        return response.data.map((w: any) => this.convertToAppWarranty(w));
      }

      return [];
    } catch (error: any) {
      console.error('Error obteniendo garantías:', error.message || error);
      throw new Error(error.message || 'Error al obtener garantías');
    }
  }

  /**
   * Obtiene una garantía por ID
   */
  static async getWarrantyById(id: string): Promise<Warranty | null> {
    try {
      const response = await apiClient.get<WarrantyResponse>(
        API_ENDPOINTS.USER.WARRANTY_BY_ID(id)
      );

      if (response.success && response.data) {
        return this.convertToAppWarranty(response.data);
      }

      return null;
    } catch (error: any) {
      console.error('Error obteniendo garantía:', error.message || error);
      throw new Error(error.message || 'Error al obtener garantía');
    }
  }

  /**
   * Crea una nueva garantía
   */
  static async createWarranty(data: CreateWarrantyData): Promise<Warranty | null> {
    try {
      const response = await apiClient.post<WarrantyResponse>(
        API_ENDPOINTS.USER.WARRANTIES,
        {
          productName: data.productName,
          category: data.category,
          store: data.store,
          purchaseDate: data.purchaseDate,
          price: data.price,
          warrantyMonths: data.warrantyMonths,
          serialNumber: data.serialNumber,
          model: data.model,
          brand: data.brand,
          receiptPhoto: data.receiptPhoto,
          productPhoto: data.productPhoto,
          notes: data.notes,
        }
      );

      if (response.success && response.data) {
        return this.convertToAppWarranty(response.data);
      }

      return null;
    } catch (error: any) {
      console.error('Error creando garantía:', error.message || error);
      throw new Error(error.message || 'Error al crear garantía');
    }
  }

  /**
   * Elimina una garantía
   */
  static async deleteWarranty(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(
        API_ENDPOINTS.USER.WARRANTY_BY_ID(id)
      );

      return response.success === true;
    } catch (error: any) {
      console.error('Error eliminando garantía:', error.message || error);
      throw new Error(error.message || 'Error al eliminar garantía');
    }
  }

  /**
   * Crea una reclamación para una garantía
   */
  static async createClaim(
    warrantyId: string,
    data: CreateClaimData
  ): Promise<boolean> {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.USER.CREATE_CLAIM(warrantyId),
        {
          description: data.description,
          issueType: data.issueType,
          preferredResolution: data.preferredResolution,
          photos: data.photos ? JSON.stringify(data.photos) : undefined,
          videos: data.videos ? JSON.stringify(data.videos) : undefined,
        }
      );

      return response.success === true;
    } catch (error: any) {
      console.error('Error creando reclamación:', error.message || error);
      throw new Error(error.message || 'Error al crear reclamación');
    }
  }

  /**
   * Obtiene notificaciones del usuario
   */
  static async getNotifications(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.USER.NOTIFICATIONS
      );

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (error: any) {
      console.error('Error obteniendo notificaciones:', error.message || error);
      return [];
    }
  }

  /**
   * Convierte una garantía del formato del backend al formato de la app
   */
  private static convertToAppWarranty(backendWarranty: any): Warranty {
    const purchaseDate = new Date(backendWarranty.purchaseDate);
    const warrantyMonths = backendWarranty.warrantyMonths || 36;
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);

    return {
      id: backendWarranty.id,
      productName: backendWarranty.productName,
      category: backendWarranty.category || 'Electrónica',
      store: backendWarranty.store,
      purchaseDate: purchaseDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      price: backendWarranty.price,
      serialNumber: backendWarranty.serialNumber || undefined,
      model: backendWarranty.model || undefined,
      brand: backendWarranty.brand || undefined,
      receiptPhoto: backendWarranty.receiptPhoto || undefined,
      productPhoto: backendWarranty.productPhoto || undefined,
      notes: backendWarranty.notes || undefined,
      userId: backendWarranty.userId,
      createdAt: backendWarranty.createdAt || new Date().toISOString(),
      status: this.calculateStatus(expiryDate),
      daysRemaining: this.calculateDaysRemaining(expiryDate),
      warrantyMonths: warrantyMonths,
    };
  }

  /**
   * Calcula el estado de la garantía
   */
  private static calculateStatus(expiryDate: Date): 'active' | 'expiring' | 'expired' {
    const now = new Date();
    const daysRemaining = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) {
      return 'expired';
    } else if (daysRemaining <= 30) {
      return 'expiring';
    } else {
      return 'active';
    }
  }

  /**
   * Calcula los días restantes de garantía
   */
  private static calculateDaysRemaining(expiryDate: Date): number {
    const now = new Date();
    const daysRemaining = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, daysRemaining);
  }
}

/**
 * Hook para usar con React (opcional, para facilitar uso en componentes)
 */
export const useWarrantyApi = () => {
  return {
    getWarranties: WarrantyApiService.getWarranties,
    getWarrantyById: WarrantyApiService.getWarrantyById,
    createWarranty: WarrantyApiService.createWarranty,
    deleteWarranty: WarrantyApiService.deleteWarranty,
    createClaim: WarrantyApiService.createClaim,
    getNotifications: WarrantyApiService.getNotifications,
  };
};
