import { OCRResult, Product } from '../types';
import { generateUniqueId } from '../utils/encryption';
import { createWorker } from 'tesseract.js';

/**
 * Servicio de OCR para extraer datos de tickets usando Tesseract.js
 */
export class OCRService {

  /**
   * Procesa una imagen y extrae datos del ticket usando Tesseract.js
   */
  static async processTicketImage(imageUri: string): Promise<OCRResult> {
    try {
      console.log('Iniciando procesamiento OCR con Tesseract.js:', imageUri);

      // Crear worker de Tesseract
      const worker = await createWorker('spa', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      // Configurar opciones para mejorar reconocimiento de tickets
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789€$.,:-/\n ',
        tessedit_pageseg_mode: '6', // Asume un bloque de texto uniforme
      });

      // Procesar imagen
      const { data } = await worker.recognize(imageUri);
      await worker.terminate();

      const rawText = data.text;
      console.log('Texto extraído:', rawText);

      // Extraer información estructurada del texto
      const purchaseDate = this.extractPurchaseDate(rawText);
      const ticketNumber = this.extractTicketNumber(rawText);
      const purchaseTime = this.extractPurchaseTime(rawText);
      const storeName = this.extractStoreName(rawText);
      const storeAddress = this.extractStoreAddress(rawText);
      const products = this.extractProducts(rawText);
      const total = this.extractTotal(rawText);

      const result: OCRResult = {
        purchaseDate,
        ticketNumber,
        purchaseTime,
        storeName,
        storeAddress,
        products,
        total,
        rawText
      };

      console.log('Resultado OCR:', result);
      return result;
    } catch (error) {
      console.error('Error procesando OCR:', error);
      return {
        rawText: 'Error al procesar imagen. Por favor, ingresa los datos manualmente.'
      };
    }
  }

  /**
   * Extrae la fecha de compra del texto OCR
   */
  static extractPurchaseDate(text: string): string | undefined {
    // Patrones comunes de fecha en tickets españoles
    const datePatterns = [
      // DD/MM/YYYY o DD-MM-YYYY
      {
        pattern: /(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/,
        format: (m: RegExpMatchArray) => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
      },
      // DD/MM/YY o DD-MM-YY
      {
        pattern: /(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{2})\b/,
        format: (m: RegExpMatchArray) => {
          const year = parseInt(m[3]) > 50 ? `19${m[3]}` : `20${m[3]}`;
          return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
        }
      },
      // YYYY-MM-DD
      {
        pattern: /(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})/,
        format: (m: RegExpMatchArray) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
      },
      // Formato escrito: "15 de enero de 2024"
      {
        pattern: /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i,
        format: (m: RegExpMatchArray) => {
          const months: { [key: string]: string } = {
            'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
            'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
            'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
          };
          return `${m[3]}-${months[m[2].toLowerCase()]}-${m[1].padStart(2, '0')}`;
        }
      }
    ];

    for (const { pattern, format } of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const dateStr = format(match);
          // Validar que la fecha sea válida
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return dateStr;
          }
        } catch (e) {
          continue;
        }
      }
    }

    return undefined;
  }

  /**
   * Extrae la hora de compra del texto OCR
   */
  static extractPurchaseTime(text: string): string | undefined {
    // Patrones de tiempo
    const timePatterns = [
      /(?:hora|time|h)[:\s]*(\d{1,2}):(\d{2})(?::(\d{2}))?/i,  // "Hora: 14:30"
      /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(?:h|hs)?/,  // "14:30" o "14:30 h"
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        const hour = match[1].padStart(2, '0');
        const minute = match[2].padStart(2, '0');
        // Validar hora
        if (parseInt(hour) < 24 && parseInt(minute) < 60) {
          return `${hour}:${minute}`;
        }
      }
    }

    return undefined;
  }

  /**
   * Extrae el número de ticket del texto OCR
   */
  static extractTicketNumber(text: string): string | undefined {
    const patterns = [
      /(?:ticket|tkt)[:\s#]*(\d+)/i,
      /(?:factura|fact)[:\s#.]*(\d+)/i,
      /(?:recibo|rec)[:\s#]*(\d+)/i,
      /n[º°ª\.]\s*(?:ticket|factura|recibo)?[:\s]*(\d+)/i,
      /(?:ref|referencia)[:\s#]*(\d+)/i,
      /(?:operaci[oó]n|oper)[:\s#]*(\d+)/i,
      /(?:transacci[oó]n|trans)[:\s#]*(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Buscar cualquier número largo como último recurso (mínimo 6 dígitos)
    const longNumberMatch = text.match(/\b(\d{6,})\b/);
    if (longNumberMatch) {
      return longNumberMatch[1];
    }

    return undefined;
  }

  /**
   * Extrae el nombre de la tienda del texto OCR
   */
  static extractStoreName(text: string): string | undefined {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Tiendas conocidas en España (cadenas electrónica/telefonía)
    const knownStores = [
      { pattern: /media\s*markt/i, name: 'MediaMarkt' },
      { pattern: /worten/i, name: 'Worten' },
      { pattern: /el\s*corte\s*ingl[eé]s/i, name: 'El Corte Inglés' },
      { pattern: /fnac/i, name: 'Fnac' },
      { pattern: /pc\s*componentes/i, name: 'PcComponentes' },
      { pattern: /carrefour/i, name: 'Carrefour' },
      { pattern: /alcampo/i, name: 'Alcampo' },
      { pattern: /leroy\s*merlin/i, name: 'Leroy Merlin' },
      { pattern: /decathlon/i, name: 'Decathlon' },
      { pattern: /amazon/i, name: 'Amazon' }
    ];

    // Primero buscar tiendas conocidas en todo el texto
    const fullText = text.toLowerCase();
    for (const store of knownStores) {
      if (store.pattern.test(fullText)) {
        return store.name;
      }
    }

    // Si no encuentra tienda conocida, buscar en las primeras líneas
    for (const line of lines.slice(0, 5)) {
      // Saltar líneas que son claramente datos fiscales o administrativos
      if (line.match(/(?:cif|nif|iva|tel[eé]fono|tel|fax|web|www|email|@)/i)) {
        continue;
      }
      // Saltar líneas que son solo números o fechas
      if (line.match(/^\d+[\/\-\.\s]*\d*$/)) {
        continue;
      }
      // Saltar líneas muy cortas o muy largas
      if (line.length < 3 || line.length > 60) {
        continue;
      }
      // Aceptar líneas con al menos una letra
      if (line.match(/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/)) {
        return line;
      }
    }

    return undefined;
  }

  /**
   * Extrae la dirección de la tienda del texto OCR
   */
  static extractStoreAddress(text: string): string | undefined {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Patrones comunes de direcciones
    const addressPatterns = [
      /(?:calle|c\/|av|avda|avenida|plaza|pl|paseo|p\.?)\s+[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s,]+\d+/i,
      /[a-zA-Z\s]+,?\s*\d{5}\s*[a-zA-Z]+/i,  // "Ciudad, 28001 Madrid"
    ];

    for (const line of lines.slice(0, 10)) {
      for (const pattern of addressPatterns) {
        if (pattern.test(line)) {
          return line;
        }
      }
    }

    return undefined;
  }

  /**
   * Extrae el total del texto OCR
   */
  static extractTotal(text: string): number | undefined {
    const totalPatterns = [
      // "TOTAL: XX,XX €" o "TOTAL: XX.XX €"
      /(?:total|importe\s*total|a\s*pagar)[:\s]*(\d{1,}[,\.]\d{2})\s*€?/i,
      // "TOTAL EUR XX,XX"
      /total\s*(?:eur|€)?\s*[:\s]*(\d{1,}[,\.]\d{2})/i,
      // Con separador de miles: "1.234,56 €"
      /(?:total|importe)[:\s]*(\d{1,3}(?:\.\d{3})*[,]\d{2})\s*€?/i,
      // "XX,XX € TOTAL"
      /(\d{1,}[,\.]\d{2})\s*€?\s*(?:total|a\s*pagar)/i,
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Manejar formato español: 1.234,56 -> 1234.56
        let numStr = match[1];
        if (numStr.includes('.') && numStr.includes(',')) {
          // Formato: 1.234,56 (separador miles = punto, decimal = coma)
          numStr = numStr.replace(/\./g, '').replace(',', '.');
        } else if (numStr.includes(',')) {
          // Formato: 234,56 (solo coma decimal)
          numStr = numStr.replace(',', '.');
        }

        const amount = parseFloat(numStr);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }

    return undefined;
  }

  /**
   * Extrae el NIF de la empresa del texto OCR
   */
  static extractNIF(text: string): string | undefined {
    // Formato NIF español: letra + 8 dígitos o 8 dígitos + letra
    const patterns = [
      /(?:nif|cif)[:\s]*([a-z]\d{8}|\d{8}[a-z])/i,
      /\b([a-z]\d{8}|\d{8}[a-z])\b/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }

    return undefined;
  }

  /**
   * Extrae el IVA del texto OCR
   */
  static extractIVA(text: string): number | undefined {
    const ivaPatterns = [
      /iva\s*(?:21%?|10%?|4%?)[:\s]*(\d{1,}[,\.]\d{2})\s*€?/i,
      /(?:base\s*imponible|base)[:\s]*(\d{1,}[,\.]\d{2})/i,
    ];

    for (const pattern of ivaPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          return amount;
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
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Helper para parsear números españoles
    const parseSpanishNumber = (str: string): number => {
      let numStr = str;
      // Formato español con separador de miles: 1.234,56
      if (numStr.includes('.') && numStr.includes(',')) {
        numStr = numStr.replace(/\./g, '').replace(',', '.');
      } else if (numStr.includes(',')) {
        // Solo coma decimal: 234,56
        numStr = numStr.replace(',', '.');
      }
      return parseFloat(numStr);
    };

    // Patrones comunes de productos en tickets españoles
    const productPatterns = [
      // "Nombre    cantidad x precio = total" o "Nombre  cantidad x precio  total"
      {
        pattern: /^(.+?)\s+(\d+)\s*[xX×]\s*(\d+[,\.]\d{2})\s*[=€]?\s*(\d+[,\.]\d{2})/,
        parse: (m: RegExpMatchArray) => ({
          name: m[1].trim(),
          quantity: parseInt(m[2]),
          unitPrice: parseSpanishNumber(m[3]),
          totalPrice: parseSpanishNumber(m[4])
        })
      },
      // "cantidad x Nombre = total €"
      {
        pattern: /^(\d+)\s*[xX×]\s*(.+?)\s*[=:€]\s*(\d+[,\.]\d{2})\s*€?$/,
        parse: (m: RegExpMatchArray) => {
          const quantity = parseInt(m[1]);
          const totalPrice = parseSpanishNumber(m[3]);
          return {
            name: m[2].trim(),
            quantity,
            unitPrice: totalPrice / quantity,
            totalPrice
          };
        }
      },
      // "Nombre    cantidad    precio_unitario    total"
      {
        pattern: /^(.{3,50}?)\s+(\d+)\s+(\d+[,\.]\d{2})\s+(\d+[,\.]\d{2})\s*€?$/,
        parse: (m: RegExpMatchArray) => ({
          name: m[1].trim(),
          quantity: parseInt(m[2]),
          unitPrice: parseSpanishNumber(m[3]),
          totalPrice: parseSpanishNumber(m[4])
        })
      },
      // "Nombre    total €" (formato simple, cantidad implícita = 1)
      {
        pattern: /^(.{5,60}?)\s+(\d+[,\.]\d{2})\s*€?\s*$/,
        parse: (m: RegExpMatchArray) => ({
          name: m[1].trim(),
          quantity: 1,
          unitPrice: parseSpanishNumber(m[2]),
          totalPrice: parseSpanishNumber(m[2])
        })
      },
      // Formato con tabs o múltiples espacios
      {
        pattern: /^(.+?)\s{2,}(\d+)\s{2,}(\d+[,\.]\d{2})\s{2,}(\d+[,\.]\d{2})/,
        parse: (m: RegExpMatchArray) => ({
          name: m[1].trim(),
          quantity: parseInt(m[2]),
          unitPrice: parseSpanishNumber(m[3]),
          totalPrice: parseSpanishNumber(m[4])
        })
      }
    ];

    // Palabras que indican que no es un producto
    const excludeKeywords = /(?:total|subtotal|iva|base\s*imponible|descuento|dto|ahorro|cambio|efectivo|tarjeta|visa|mastercard|gracias|thank|cif|nif|tel|fax|horario|web|email|www|@|factura|ticket|ref|fecha|hora)/i;

    for (const line of lines) {
      // Saltar líneas con palabras clave de no-producto
      if (excludeKeywords.test(line)) {
        continue;
      }

      // Saltar líneas muy cortas
      if (line.length < 5) {
        continue;
      }

      // Intentar extraer con cada patrón
      for (const { pattern, parse } of productPatterns) {
        const match = line.match(pattern);
        if (match) {
          try {
            const productData = parse(match);

            // Validar datos extraídos
            if (productData.name &&
                productData.name.length >= 3 &&
                productData.quantity > 0 &&
                productData.unitPrice > 0 &&
                productData.totalPrice > 0) {

              products.push({
                id: generateUniqueId(),
                name: productData.name,
                quantity: productData.quantity,
                unitPrice: productData.unitPrice,
                totalPrice: productData.totalPrice,
                sku: this.generateSKU()
              });

              break; // Salir del bucle de patrones si encontramos coincidencia
            }
          } catch (e) {
            // Si falla el parseo, continuar con el siguiente patrón
            continue;
          }
        }
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
