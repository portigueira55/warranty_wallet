import { OCRResult, Product } from '../types';
import { generateUniqueId } from '../utils/encryption';

/**
 * Servicio de OCR para extraer datos de tickets
 * Nota: En producción se usaría Tesseract.js o Google Cloud Vision
 */
export class OCRService {

  /**
   * Procesa una imagen y extrae datos del ticket
   * En producción: usar Tesseract.js o API de OCR
   */
  static async processTicketImage(imageUri: string): Promise<OCRResult> {
    try {
      // Simulación de procesamiento OCR
      // En producción se integraría con Tesseract.js o servicio cloud
      console.log('Procesando imagen:', imageUri);

      // Por ahora devolvemos datos de ejemplo
      // En producción el OCR extraería estos datos
      const mockResult: OCRResult = {
        purchaseDate: new Date().toISOString().split('T')[0],
        ticketNumber: this.generateTicketNumber(),
        purchaseTime: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        storeName: 'Tienda Demo',
        storeAddress: 'Calle Principal 123',
        products: [],
        total: 0,
        rawText: 'Texto extraído del ticket por OCR'
      };

      return mockResult;
    } catch (error) {
      console.error('Error procesando OCR:', error);
      return {
        rawText: 'Error al procesar imagen'
      };
    }
  }

  /**
   * Extrae la fecha de compra del texto OCR
   */
  static extractPurchaseDate(text: string): string | undefined {
    // Patrones comunes de fecha en tickets españoles
    const datePatterns = [
      /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,  // DD/MM/YYYY o DD-MM-YYYY
      /(\d{2})[\/\-](\d{2})[\/\-](\d{2})/,  // DD/MM/YY
      /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/   // YYYY-MM-DD
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        // Normalizar a formato ISO
        if (match[0].length === 10 && match[3].length === 4) {
          return `${match[3]}-${match[2]}-${match[1]}`;
        }
      }
    }

    return undefined;
  }

  /**
   * Extrae la hora de compra del texto OCR
   */
  static extractPurchaseTime(text: string): string | undefined {
    const timePattern = /(\d{2}):(\d{2})(?::(\d{2}))?/;
    const match = text.match(timePattern);

    if (match) {
      return `${match[1]}:${match[2]}`;
    }

    return undefined;
  }

  /**
   * Extrae el número de ticket del texto OCR
   */
  static extractTicketNumber(text: string): string | undefined {
    const patterns = [
      /ticket[:\s#]*(\d+)/i,
      /factura[:\s#]*(\d+)/i,
      /n[º°][:\s]*(\d+)/i,
      /ref[:\s#]*(\d+)/i,
      /(\d{4,})/  // Cualquier número largo
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * Extrae el nombre de la tienda del texto OCR
   */
  static extractStoreName(text: string): string | undefined {
    const lines = text.split('\n');
    // Normalmente el nombre de la tienda está en las primeras líneas
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 3 && line.length < 50) {
        // Filtrar líneas que probablemente no son el nombre
        if (!line.match(/^\d+/) && !line.match(/cif|nif|tel/i)) {
          return line;
        }
      }
    }

    return undefined;
  }

  /**
   * Extrae productos del texto OCR
   */
  static extractProducts(text: string): Partial<Product>[] {
    const products: Partial<Product>[] = [];
    const lines = text.split('\n');

    // Patrón común: descripción + cantidad + precio
    const productPattern = /(.+?)\s+(\d+)\s+(\d+[,\.]\d{2})/;

    for (const line of lines) {
      const match = line.match(productPattern);
      if (match) {
        products.push({
          id: generateUniqueId(),
          name: match[1].trim(),
          quantity: parseInt(match[2]),
          unitPrice: parseFloat(match[3].replace(',', '.')),
          totalPrice: parseFloat(match[3].replace(',', '.')) * parseInt(match[2]),
          sku: this.generateSKU()
        });
      }
    }

    return products;
  }

  /**
   * Genera un número de ticket aleatorio
   */
  private static generateTicketNumber(): string {
    return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
  }

  /**
   * Genera un SKU aleatorio
   */
  private static generateSKU(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sku = '';
    for (let i = 0; i < 8; i++) {
      sku += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sku;
  }

  /**
   * Calcula la fecha de fin de garantía (3 años)
   */
  static calculateWarrantyEndDate(purchaseDate: string): string {
    const date = new Date(purchaseDate);
    date.setFullYear(date.getFullYear() + 3);
    return date.toISOString();
  }
}
