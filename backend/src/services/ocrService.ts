/**
 * Servicio de OCR para extracción de datos de tickets
 */

import Tesseract from 'tesseract.js';

export interface ReceiptData {
  store?: string;
  date?: string;
  total?: number;
  items?: string[];
  raw: string;
}

export class OCRService {
  /**
   * Procesa una imagen y extrae texto usando Tesseract OCR
   */
  static async extractText(imagePath: string): Promise<string> {
    try {
      const result = await Tesseract.recognize(imagePath, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      return result.data.text;
    } catch (error) {
      console.error('Error en OCR:', error);
      throw new Error('Error al procesar la imagen');
    }
  }

  /**
   * Extrae datos estructurados de un ticket a partir del texto OCR
   */
  static parseReceiptText(text: string): ReceiptData {
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

    // Patrones comunes para detectar información
    const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/;
    const totalPattern = /total[:\s]*\$?\s*(\d+[.,]?\d*)/i;
    const pricePattern = /\$\s*(\d+[.,]\d{2})/g;

    // Buscar fecha
    let date: string | undefined;
    for (const line of lines) {
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        date = dateMatch[1];
        break;
      }
    }

    // Buscar total
    let total: number | undefined;
    for (const line of lines) {
      const totalMatch = line.match(totalPattern);
      if (totalMatch) {
        total = parseFloat(totalMatch[1].replace(',', '.'));
        break;
      }
    }

    // Buscar tienda (generalmente en las primeras 3 líneas)
    const store = lines.slice(0, 3).join(' ');

    // Buscar items (líneas con precios)
    const items: string[] = [];
    for (const line of lines) {
      if (pricePattern.test(line)) {
        items.push(line);
      }
    }

    return {
      store: store || undefined,
      date: date || undefined,
      total: total || undefined,
      items: items.length > 0 ? items : undefined,
      raw: text,
    };
  }

  /**
   * Procesa una imagen de ticket y extrae datos estructurados
   */
  static async processReceipt(imagePath: string): Promise<ReceiptData> {
    const text = await this.extractText(imagePath);
    return this.parseReceiptText(text);
  }

  /**
   * Procesa una imagen desde un buffer
   */
  static async processReceiptFromBuffer(
    buffer: Buffer
  ): Promise<ReceiptData> {
    try {
      const result = await Tesseract.recognize(buffer, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text;
      return this.parseReceiptText(text);
    } catch (error) {
      console.error('Error procesando imagen desde buffer:', error);
      throw new Error('Error al procesar la imagen');
    }
  }
}
