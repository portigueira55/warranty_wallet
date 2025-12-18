import { WarrantyExtension, Product } from '../types';

/**
 * Servicio de gestión de garantías extendidas
 * Permite comprar, gestionar y trackear extensiones de garantía
 */

interface ExtensionProvider {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  coverageTypes: string[];
  website: string;
}

interface ExtensionQuote {
  providerId: string;
  providerName: string;
  duration: number; // meses
  price: number;
  coverage: string[];
  benefits: string[];
  exclusions: string[];
}

export class ExtendedWarrantyService {
  /**
   * Obtener proveedores de garantía extendida
   */
  static async getExtensionProviders(): Promise<ExtensionProvider[]> {
    // MOCK: Simular obtención de proveedores
    // En producción: await api.get('/warranty-providers')

    await new Promise(resolve => setTimeout(resolve, 1000));

    const providers: ExtensionProvider[] = [
      {
        id: 'provider-1',
        name: 'SquareTrade',
        logo: 'https://logo.clearbit.com/squaretrade.com',
        rating: 4.5,
        reviewCount: 12453,
        coverageTypes: ['Accidentes', 'Defectos', 'Daños por líquidos', 'Pantalla rota'],
        website: 'https://www.squaretrade.com'
      },
      {
        id: 'provider-2',
        name: 'Assurant',
        logo: 'https://logo.clearbit.com/assurant.com',
        rating: 4.2,
        reviewCount: 8765,
        coverageTypes: ['Defectos', 'Averías mecánicas', 'Desgaste normal'],
        website: 'https://www.assurant.com'
      },
      {
        id: 'provider-3',
        name: 'Extend',
        logo: 'https://logo.clearbit.com/extend.com',
        rating: 4.7,
        reviewCount: 5432,
        coverageTypes: ['Cobertura total', 'Reemplazo rápido', 'Sin deducibles'],
        website: 'https://www.extend.com'
      }
    ];

    return providers;
  }

  /**
   * Calcular precio de extensión de garantía
   */
  static async calculateExtensionPrice(
    product: Product,
    durationMonths: number,
    coverageType: 'basic' | 'standard' | 'premium' = 'standard'
  ): Promise<ExtensionQuote[]> {
    // MOCK: Simular cálculo de cotizaciones
    // En producción: await api.post('/warranty-extensions/quote', { product, duration, coverageType })

    await new Promise(resolve => setTimeout(resolve, 1200));

    const basePrice = product.price || 0;

    // Factores de precio según categoría del producto
    const categoryMultipliers: { [key: string]: number } = {
      'electronics': 0.15,
      'smartphones': 0.12,
      'laptops': 0.18,
      'appliances': 0.10,
      'default': 0.12
    };

    const multiplier = categoryMultipliers[product.category?.toLowerCase() || 'default'] || 0.12;

    // Ajuste por duración
    const durationFactor = durationMonths / 12;

    // Ajuste por tipo de cobertura
    const coverageMultipliers = {
      'basic': 0.7,
      'standard': 1.0,
      'premium': 1.5
    };

    const baseCost = basePrice * multiplier * durationFactor * coverageMultipliers[coverageType];

    const quotes: ExtensionQuote[] = [
      {
        providerId: 'provider-1',
        providerName: 'SquareTrade',
        duration: durationMonths,
        price: Math.round(baseCost * 0.95 * 100) / 100, // 5% descuento
        coverage: [
          'Defectos de fabricación',
          'Fallos mecánicos y eléctricos',
          'Daños accidentales',
          'Pantalla rota (si aplica)',
          'Daños por líquidos'
        ],
        benefits: [
          'Reembolso completo si no se puede reparar',
          'Reparación o reemplazo en 5 días',
          'Sin deducibles',
          'Soporte 24/7'
        ],
        exclusions: [
          'Pérdida o robo',
          'Daño cosmético',
          'Batería (excepto fallo total)',
          'Software'
        ]
      },
      {
        providerId: 'provider-2',
        providerName: 'Assurant',
        duration: durationMonths,
        price: Math.round(baseCost * 0.88 * 100) / 100, // 12% descuento
        coverage: [
          'Defectos de fabricación',
          'Fallos mecánicos',
          'Desgaste normal de piezas'
        ],
        benefits: [
          'Reparación o reemplazo',
          'Red de técnicos certificados',
          'Garantía de reparación de 90 días'
        ],
        exclusions: [
          'Daños accidentales',
          'Pérdida o robo',
          'Daños por líquidos',
          'Daño cosmético'
        ]
      },
      {
        providerId: 'provider-3',
        providerName: 'Extend',
        duration: durationMonths,
        price: Math.round(baseCost * 1.1 * 100) / 100, // 10% premium
        coverage: [
          'Cobertura total contra defectos',
          'Daños accidentales ilimitados',
          'Protección contra líquidos',
          'Pantalla y componentes internos',
          'Batería (degradación >50%)'
        ],
        benefits: [
          'Reemplazo inmediato si no se repara en 7 días',
          'Sin límite de reclamaciones',
          'Sin deducibles nunca',
          'Transferible a nuevo dueño',
          'Soporte premium 24/7'
        ],
        exclusions: [
          'Pérdida intencional',
          'Robo sin denuncia',
          'Modificaciones no autorizadas'
        ]
      }
    ];

    return quotes;
  }

  /**
   * Comprar extensión de garantía
   */
  static async purchaseExtension(
    ticketId: string,
    productId: string,
    quote: ExtensionQuote,
    paymentMethod: string
  ): Promise<{
    success: boolean;
    message: string;
    extension?: WarrantyExtension;
  }> {
    // MOCK: Simular compra de extensión
    // En producción: await api.post('/warranty-extensions/purchase', { ticketId, quote, paymentMethod })

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular procesamiento de pago
    const paymentSuccess = true;

    if (!paymentSuccess) {
      return {
        success: false,
        message: 'Error al procesar el pago. Verifica tus datos e intenta nuevamente.'
      };
    }

    const extension: WarrantyExtension = {
      id: `ext-${Date.now()}`,
      ticketId,
      productId,
      provider: quote.providerName,
      providerId: quote.providerId,
      purchaseDate: new Date().toISOString(),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + quote.duration * 30 * 24 * 60 * 60 * 1000).toISOString(),
      cost: quote.price,
      coverage: quote.coverage,
      policyNumber: `POL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'active',
      claimLimit: null, // ilimitado
      claimsUsed: 0,
      terms: quote.benefits.join('; '),
      contactPhone: '+34 900 123 456',
      contactEmail: `soporte@${quote.providerName.toLowerCase()}.com`
    };

    return {
      success: true,
      message: 'Garantía extendida activada correctamente',
      extension
    };
  }

  /**
   * Obtener extensiones activas de un usuario
   */
  static async getUserExtensions(userId: string): Promise<WarrantyExtension[]> {
    // MOCK: Simular obtención de extensiones
    // En producción: await api.get(`/users/${userId}/warranty-extensions`)

    await new Promise(resolve => setTimeout(resolve, 600));

    const mockExtensions: WarrantyExtension[] = [
      {
        id: 'ext-123',
        ticketId: 'ticket-1',
        productId: 'product-1',
        provider: 'SquareTrade',
        providerId: 'provider-1',
        purchaseDate: '2024-01-15T10:00:00Z',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2026-01-15T10:00:00Z',
        cost: 89.99,
        coverage: ['Defectos', 'Daños accidentales', 'Pantalla rota'],
        policyNumber: 'POL-ABC123DEF',
        status: 'active',
        claimLimit: null,
        claimsUsed: 1,
        terms: 'Cobertura completa por 24 meses',
        contactPhone: '+34 900 123 456',
        contactEmail: 'soporte@squaretrade.com'
      }
    ];

    return mockExtensions;
  }

  /**
   * Obtener extensión por ID
   */
  static async getExtension(extensionId: string): Promise<WarrantyExtension | null> {
    // MOCK: Simular obtención de extensión
    // En producción: await api.get(`/warranty-extensions/${extensionId}`)

    await new Promise(resolve => setTimeout(resolve, 400));

    const extensions = await this.getUserExtensions('mock-user');
    return extensions.find(ext => ext.id === extensionId) || null;
  }

  /**
   * Verificar si un producto es elegible para extensión
   */
  static isEligibleForExtension(
    purchaseDate: string,
    warrantyEndDate: string,
    productCategory?: string
  ): {
    eligible: boolean;
    reason?: string;
  } {
    const now = new Date();
    const purchase = new Date(purchaseDate);
    const warrantyEnd = new Date(warrantyEndDate);

    // Debe estar dentro del periodo de garantía original
    if (warrantyEnd < now) {
      return {
        eligible: false,
        reason: 'La garantía original ya expiró'
      };
    }

    // No debe haber pasado más de 30 días desde la compra (política común)
    const daysSincePurchase = Math.floor((now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSincePurchase > 30) {
      return {
        eligible: false,
        reason: 'Debes comprar la extensión dentro de los primeros 30 días'
      };
    }

    // Categorías no elegibles
    const ineligibleCategories = ['consumables', 'software', 'accessories'];
    if (productCategory && ineligibleCategories.includes(productCategory.toLowerCase())) {
      return {
        eligible: false,
        reason: 'Esta categoría de producto no es elegible para extensión'
      };
    }

    return {
      eligible: true
    };
  }

  /**
   * Cancelar extensión de garantía (con reembolso prorrateado)
   */
  static async cancelExtension(
    extensionId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message: string;
    refundAmount?: number;
  }> {
    // MOCK: Simular cancelación
    // En producción: await api.post(`/warranty-extensions/${extensionId}/cancel`, { reason })

    await new Promise(resolve => setTimeout(resolve, 1000));

    const extension = await this.getExtension(extensionId);

    if (!extension) {
      return {
        success: false,
        message: 'Extensión no encontrada'
      };
    }

    // Calcular reembolso prorrateado
    const now = new Date();
    const start = new Date(extension.startDate);
    const end = new Date(extension.endDate);

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const remaining = totalDuration - elapsed;

    const refundPercentage = Math.max(0, remaining / totalDuration);
    const refundAmount = Math.round(extension.cost * refundPercentage * 100) / 100;

    return {
      success: true,
      message: 'Extensión cancelada correctamente',
      refundAmount
    };
  }

  /**
   * Crear reclamación en garantía extendida
   */
  static async createExtensionClaim(
    extensionId: string,
    issueDescription: string,
    photos?: string[]
  ): Promise<{
    success: boolean;
    message: string;
    claimNumber?: string;
  }> {
    // MOCK: Simular creación de reclamación
    // En producción: await api.post(`/warranty-extensions/${extensionId}/claims`, { issueDescription, photos })

    await new Promise(resolve => setTimeout(resolve, 1500));

    const claimNumber = `CLAIM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return {
      success: true,
      message: 'Reclamación creada correctamente. Serás contactado en 24-48 horas.',
      claimNumber
    };
  }
}
