import { ProductInfo, Manufacturer } from '../types';

/**
 * Servicio de búsqueda de información de productos
 * MOCK: En producción, esto consultará APIs como Amazon, Open Food Facts, etc.
 */

export class ProductLookupService {
  /**
   * Buscar producto por código EAN
   */
  static async lookupByEAN(ean: string): Promise<ProductInfo | null> {
    // MOCK: Simular búsqueda en base de datos de productos
    // En producción: await api.get('/products/lookup/ean/${ean}')
    // O integración con APIs como Open EAN Database, Amazon Product API

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Base de datos mock de productos comunes
    const productDatabase: { [key: string]: ProductInfo } = {
      '8806094308563': {
        ean: '8806094308563',
        name: 'Samsung Galaxy A23 Ultra 256GB',
        brand: 'Samsung',
        category: 'Smartphones',
        imageUrl: 'https://images.samsung.com/is/image/samsung/p6pim/es/sm-a235fzwieub/gallery/es-galaxy-a23-5g-sm-a235-sm-a235fzwieub-534870472',
        manualUrl: 'https://www.samsung.com/es/support/model/SM-A235FZWIEUB/#downloads',
        averagePrice: 449.99,
        manufacturer: {
          id: 'samsung',
          name: 'Samsung Electronics',
          logo: 'https://logo.clearbit.com/samsung.com',
          contactPhone: '+34 902 404 040',
          supportEmail: 'soporte@samsung.es',
          website: 'https://www.samsung.com/es/support/',
          warrantyInfo: 'Garantía de 24 meses'
        }
      },
      '194253715634': {
        ean: '194253715634',
        name: 'Apple AirPods Pro (2ª generación)',
        brand: 'Apple',
        category: 'Audio',
        imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83',
        manualUrl: 'https://support.apple.com/es-es/guide/airpods/welcome/ios',
        averagePrice: 279.00,
        manufacturer: {
          id: 'apple',
          name: 'Apple Inc.',
          logo: 'https://logo.clearbit.com/apple.com',
          contactPhone: '+34 900 150 503',
          supportEmail: 'soporte@apple.com',
          website: 'https://support.apple.com/es-es',
          warrantyInfo: 'Garantía limitada de 1 año'
        }
      }
    };

    return productDatabase[ean] || null;
  }

  /**
   * Buscar producto por código ASIN (Amazon)
   */
  static async lookupByASIN(asin: string): Promise<ProductInfo | null> {
    // MOCK: Simular búsqueda en Amazon Product API
    // En producción: Integración con Amazon Product Advertising API

    await new Promise(resolve => setTimeout(resolve, 1000));

    const productDatabase: { [key: string]: ProductInfo } = {
      'B0BDK62PDX': {
        asin: 'B0BDK62PDX',
        ean: '0840244700553',
        name: 'Amazon Echo Dot (5ª generación)',
        brand: 'Amazon',
        category: 'Smart Home',
        imageUrl: 'https://m.media-amazon.com/images/I/71JN0-VLDLS._AC_SL1000_.jpg',
        manualUrl: 'https://www.amazon.es/gp/help/customer/display.html?nodeId=GFMFZFBXF8X9Z9K9',
        averagePrice: 59.99
      }
    };

    return productDatabase[asin] || null;
  }

  /**
   * Buscar producto por nombre
   */
  static async searchByName(query: string): Promise<ProductInfo[]> {
    // MOCK: Simular búsqueda textual
    // En producción: await api.get('/products/search?q=${query}')

    await new Promise(resolve => setTimeout(resolve, 800));

    const allProducts = [
      await this.lookupByEAN('8806094308563'),
      await this.lookupByEAN('194253715634'),
      await this.lookupByASIN('B0BDK62PDX')
    ];

    return allProducts
      .filter(p => p !== null)
      .filter(p =>
        p!.name.toLowerCase().includes(query.toLowerCase()) ||
        p!.brand?.toLowerCase().includes(query.toLowerCase())
      ) as ProductInfo[];
  }

  /**
   * Obtener manual del usuario para un producto
   */
  static async getProductManual(
    productName: string,
    brand?: string,
    modelNumber?: string
  ): Promise<{
    found: boolean;
    url?: string;
    alternativeUrls?: string[];
    message?: string;
  }> {
    // MOCK: Simular búsqueda de manuales
    // En producción: Integración con bases de datos como ManualsLib, manufacturer websites

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Base de datos mock de manuales
    const manualDatabase: { [key: string]: string } = {
      'samsung galaxy': 'https://www.samsung.com/es/support/model/SM-A235FZWIEUB/#downloads',
      'apple airpods': 'https://support.apple.com/es-es/guide/airpods/welcome/ios',
      'lg oled': 'https://www.lg.com/es/soporte/manuales-de-producto',
      'bose quietcomfort': 'https://assets.bose.com/content/dam/Bose_DAM/Web/consumer_electronics/global/products/headphones/qc35_ii/pdf/user_guide/QC35-II_OG_ES.pdf'
    };

    const searchKey = `${brand || ''} ${productName}`.toLowerCase();

    for (const [key, url] of Object.entries(manualDatabase)) {
      if (searchKey.includes(key)) {
        return {
          found: true,
          url,
          message: `Manual encontrado para ${productName}`
        };
      }
    }

    // Si no se encuentra, sugerir alternativas
    return {
      found: false,
      alternativeUrls: [
        'https://www.manualslib.com',
        'https://www.manuals.plus'
      ],
      message: 'Manual no encontrado. Prueba en las páginas de manuales sugeridas.'
    };
  }

  /**
   * Obtener imagen del producto por búsqueda
   */
  static async getProductImage(
    productName: string,
    brand?: string
  ): Promise<string | null> {
    // MOCK: Simular búsqueda de imagen
    // En producción: Integración con Google Images API o similar

    await new Promise(resolve => setTimeout(resolve, 500));

    // Retornar URL de placeholder por ahora
    const searchQuery = encodeURIComponent(`${brand || ''} ${productName}`);

    // En producción, aquí iría la búsqueda real de imágenes
    return `https://via.placeholder.com/400x400.png?text=${searchQuery}`;
  }

  /**
   * Categorizar automáticamente un producto
   */
  static categorizeProduct(productName: string): string {
    const categoryKeywords: { [key: string]: string[] } = {
      'Smartphones': ['phone', 'smartphone', 'móvil', 'iphone', 'galaxy', 'pixel'],
      'Laptops': ['laptop', 'notebook', 'macbook', 'portátil', 'chromebook'],
      'TV & Audio': ['tv', 'televisión', 'soundbar', 'altavoz', 'auriculares', 'airpods', 'headphones'],
      'Electrodomésticos': ['nevera', 'lavadora', 'secadora', 'lavavajillas', 'horno', 'microondas'],
      'Gaming': ['playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'ps4'],
      'Smart Home': ['echo', 'alexa', 'google home', 'nest', 'ring'],
      'Fotografía': ['cámara', 'camera', 'canon', 'nikon', 'sony alpha'],
      'Tablets': ['ipad', 'tablet', 'galaxy tab'],
      'Wearables': ['watch', 'reloj', 'band', 'pulsera', 'fitbit'],
      'PC Components': ['gpu', 'rtx', 'procesador', 'ryzen', 'intel', 'ram', 'ssd']
    };

    const lowerName = productName.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (lowerName.includes(keyword)) {
          return category;
        }
      }
    }

    return 'Otros';
  }

  /**
   * Escanear código de barras usando OCR
   */
  static async scanBarcode(imageUri: string): Promise<{
    type: 'EAN' | 'QR' | 'UPC' | 'CODE128' | null;
    value: string | null;
  }> {
    // MOCK: Simular escaneo de código de barras
    // En producción: Usar biblioteca como react-native-vision-camera + ML Kit

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simular detección exitosa
    return {
      type: 'EAN',
      value: '8806094308563' // EAN de ejemplo
    };
  }
}
