/**
 * Controlador para procesamiento OCR de tickets
 */

import { Request, Response } from 'express';
import { OCRService } from '../services/ocrService';
import { successResponse, errorResponse } from '../utils/response';

export class OCRController {
  /**
   * POST /api/ocr/process
   * Procesa una imagen de ticket y extrae datos
   */
  static async processReceipt(req: Request, res: Response) {
    try {
      // Verificar que se haya subido un archivo
      if (!req.file) {
        return res.status(400).json(
          errorResponse('No se proporcionó ninguna imagen')
        );
      }

      console.log('Procesando imagen:', req.file.originalname);

      // Procesar la imagen con OCR
      const receiptData = await OCRService.processReceiptFromBuffer(
        req.file.buffer
      );

      return res.json(
        successResponse(receiptData, 'Imagen procesada exitosamente')
      );
    } catch (error: any) {
      console.error('Error procesando ticket:', error);
      return res.status(500).json(
        errorResponse('Error al procesar la imagen')
      );
    }
  }

  /**
   * POST /api/ocr/extract-text
   * Extrae solo el texto de una imagen
   */
  static async extractText(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json(
          errorResponse('No se proporcionó ninguna imagen')
        );
      }

      const text = await OCRService.extractText(req.file.path);

      return res.json(
        successResponse({ text }, 'Texto extraído exitosamente')
      );
    } catch (error: any) {
      console.error('Error extrayendo texto:', error);
      return res.status(500).json(
        errorResponse('Error al extraer texto de la imagen')
      );
    }
  }
}
