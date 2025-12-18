/**
 * Controlador para procesamiento OCR de tickets
 */

import { Request, Response } from 'express';
import { OCRService } from '../services/ocrService';
import { sendSuccess, sendError } from '../utils/response';

export class OCRController {
  /**
   * POST /api/ocr/process
   * Procesa una imagen de ticket y extrae datos
   */
  static async processReceipt(req: Request, res: Response) {
    try {
      // Verificar que se haya subido un archivo
      if (!req.file) {
        return sendError(res, 'No se proporcionó ninguna imagen', 400);
      }

      console.log('Procesando imagen:', req.file.originalname);

      // Procesar la imagen con OCR
      const receiptData = await OCRService.processReceiptFromBuffer(
        req.file.buffer
      );

      return sendSuccess(res, receiptData, 'Imagen procesada exitosamente');
    } catch (error: any) {
      console.error('Error procesando ticket:', error);
      return sendError(res, 'Error al procesar la imagen', 500);
    }
  }

  /**
   * POST /api/ocr/extract-text
   * Extrae solo el texto de una imagen
   */
  static async extractText(req: Request, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 'No se proporcionó ninguna imagen', 400);
      }

      const text = await OCRService.extractText(req.file.path);

      return sendSuccess(res, { text }, 'Texto extraído exitosamente');
    } catch (error: any) {
      console.error('Error extrayendo texto:', error);
      return sendError(res, 'Error al extraer texto de la imagen', 500);
    }
  }
}
