/**
 * Servicio de OCR que usa el backend API en lugar de procesamiento local
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import { OCRResult } from '../types';

export class OCRApiService {
  /**
   * Procesa una imagen de ticket usando el backend API
   */
  static async processTicketImage(imageUri: string): Promise<OCRResult> {
    try {
      console.log('Procesando imagen con OCR backend:', imageUri);

      // Crear FormData con la imagen
      const formData = new FormData();

      // En React Native, necesitamos crear el objeto File/Blob correctamente
      const filename = imageUri.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      // Enviar al backend
      const response = await apiClient.upload<any>(
        API_ENDPOINTS.OCR.PROCESS,
        formData
      );

      if (response.success && response.data) {
        const { store, date, total, items, raw } = response.data;

        // Convertir al formato OCRResult de la app
        return {
          storeName: store,
          purchaseDate: date,
          total: total,
          rawText: raw,
          products: items?.map((item: string, index: number) => ({
            id: `product-${index}`,
            name: item,
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
            sku: `SKU-${index}`,
          })),
        };
      }

      throw new Error('No se pudieron extraer datos del ticket');
    } catch (error: any) {
      console.error('Error procesando OCR con backend:', error);

      // Retornar resultado vacío en caso de error
      return {
        rawText: 'Error al procesar imagen con el servidor. Intenta de nuevo o ingresa los datos manualmente.',
      };
    }
  }

  /**
   * Extrae solo texto de una imagen
   */
  static async extractText(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await apiClient.upload<any>(
        API_ENDPOINTS.OCR.EXTRACT_TEXT,
        formData
      );

      if (response.success && response.data) {
        return response.data.text;
      }

      return '';
    } catch (error) {
      console.error('Error extrayendo texto:', error);
      return '';
    }
  }
}
