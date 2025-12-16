import { Product, ResaleValue } from '../types';

/**
 * Servicio de cálculo de valor residual y precio de segunda mano
 * MOCK: En producción, esto usará datos reales de mercado y ML
 */

export class ResaleValueService {
  /**
   * Calcular valor de reventa de un producto
   */
  static calculateResaleValue(
    product: Product,
    purchaseDate: string,
    warrantyEndDate: string,
    condition: ResaleValue['condition'] = 'good'
  ): ResaleValue {
    const originalPrice = product.unitPrice;
    const now = new Date();
    const purchase = new Date(purchaseDate);
    const warrantyEnd = new Date(warrantyEndDate);

    // Calcular edad del producto en meses
    const ageInMonths = Math.floor(
      (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    // Calcular meses de garantía restantes
    const warrantyMonthsLeft = Math.max(
      0,
      Math.floor((warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))
    );

    // Tasa de depreciación según categoría
    const categoryRates: { [key: string]: number } = {
      'electronics': 0.20, // 20% por año
      'appliances': 0.15,
      'clothing': 0.40,
      'furniture': 0.10,
      'tools': 0.12,
      'default': 0.15
    };

    const category = product.category || 'default';
    const annualRate = categoryRates[category] || categoryRates['default'];
    const monthlyRate = annualRate / 12;

    // Depreciación acumulada
    const depreciationRate = Math.min(0.80, ageInMonths * monthlyRate);

    // Valor base después de depreciación
    let currentValue = originalPrice * (1 - depreciationRate);

    // Ajuste por condición
    const conditionMultipliers = {
      'new': 0.95,
      'excellent': 0.85,
      'good': 0.70,
      'fair': 0.50,
      'poor': 0.30
    };

    currentValue *= conditionMultipliers[condition];

    // Bonus por garantía restante (5% por año restante, máx 15%)
    const warrantyYearsLeft = warrantyMonthsLeft / 12;
    const warrantyValueBonus = Math.min(0.15, warrantyYearsLeft * 0.05) * originalPrice;

    // Precio estimado de reventa
    const estimatedResalePrice = currentValue + warrantyValueBonus;

    // Nivel de confianza basado en edad y categoría
    let confidenceLevel: ResaleValue['confidenceLevel'] = 'medium';
    if (ageInMonths < 12 && category === 'electronics') {
      confidenceLevel = 'high';
    } else if (ageInMonths > 36) {
      confidenceLevel = 'low';
    }

    return {
      originalPrice,
      currentValue,
      depreciationRate,
      warrantyValueBonus,
      condition,
      estimatedResalePrice,
      confidenceLevel
    };
  }

  /**
   * Obtener precios de mercado de productos similares
   * MOCK: En producción, esto consultaría APIs como eBay, Wallapop, etc.
   */
  static async getMarketPrices(
    productName: string,
    ean?: string
  ): Promise<{
    average: number;
    min: number;
    max: number;
    listings: number;
  }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // MOCK: Retornar precios simulados
    // En producción: await api.get('/market-prices', { productName, ean })

    return {
      average: 250.00,
      min: 180.00,
      max: 320.00,
      listings: 15
    };
  }

  /**
   * Generar recomendaciones de venta
   */
  static getSellingRecommendations(resaleValue: ResaleValue): {
    suggestedPrice: number;
    pricingStrategy: string;
    tips: string[];
  } {
    const { estimatedResalePrice, condition, warrantyValueBonus, confidenceLevel } = resaleValue;

    // Precio sugerido (ligeramente más alto para negociación)
    const suggestedPrice = estimatedResalePrice * 1.10;

    // Estrategia de precio
    let pricingStrategy = '';
    if (confidenceLevel === 'high') {
      pricingStrategy = 'Precio competitivo - Alta demanda';
    } else if (confidenceLevel === 'medium') {
      pricingStrategy = 'Precio moderado - Demanda media';
    } else {
      pricingStrategy = 'Precio flexible - Negociable';
    }

    // Tips de venta
    const tips: string[] = [];

    if (warrantyValueBonus > 0) {
      tips.push('⭐ Destaca que la garantía aún está vigente - aumenta el valor un ' +
        Math.round((warrantyValueBonus / estimatedResalePrice) * 100) + '%');
    }

    if (condition === 'excellent' || condition === 'new') {
      tips.push('📸 Toma fotos de alta calidad para mostrar el excelente estado');
    }

    tips.push('📋 Incluye el ticket de compra y documentación');
    tips.push('🔒 Menciona que tienes todos los accesorios originales');

    if (confidenceLevel === 'low') {
      tips.push('💡 Considera aceptar ofertas razonables para venta rápida');
    }

    return {
      suggestedPrice,
      pricingStrategy,
      tips
    };
  }
}
