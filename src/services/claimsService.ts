import { WarrantyClaim, Manufacturer } from '../types';

/**
 * Servicio de reclamos de garantía
 * MOCK: En producción, esto se conectará a la API y fabricantes
 */

export class ClaimsService {
  /**
   * Crear nuevo reclamo de garantía
   */
  static async createClaim(
    ticketId: string,
    productId: string,
    userId: string,
    issueDescription: string,
    photos?: string[],
    videos?: string[]
  ): Promise<WarrantyClaim> {
    // MOCK: Simular creación en API
    // En producción: await api.post('/claims', {...})

    const claim: WarrantyClaim = {
      id: `claim-${Date.now()}`,
      ticketId,
      productId,
      userId,
      issueDescription,
      caseNumber: `CASE-${Math.floor(Math.random() * 1000000)}`,
      status: 'pending',
      photos: photos || [],
      videos: videos || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return claim;
  }

  /**
   * Obtener reclamos del usuario
   */
  static async getUserClaims(userId: string): Promise<WarrantyClaim[]> {
    // MOCK: Retornar reclamos simulados
    // En producción: await api.get('/claims/user/${userId}')

    return [
      {
        id: 'claim-1',
        ticketId: 'ticket-1',
        productId: 'product-1',
        userId,
        issueDescription: 'El producto presenta problemas de batería. Se descarga muy rápido.',
        caseNumber: 'CASE-789456',
        status: 'in_progress',
        photos: [],
        videos: [],
        manufacturerResponse: 'Hemos recibido tu caso. Un técnico se pondrá en contacto en 24-48h.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'claim-2',
        ticketId: 'ticket-2',
        productId: 'product-2',
        userId,
        issueDescription: 'La pantalla tiene píxeles muertos en la esquina superior.',
        caseNumber: 'CASE-456123',
        status: 'resolved',
        photos: [],
        videos: [],
        manufacturerResponse: 'Producto reemplazado. Número de tracking: ES123456789',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Actualizar estado de reclamo
   */
  static async updateClaimStatus(
    claimId: string,
    status: WarrantyClaim['status'],
    response?: string
  ): Promise<WarrantyClaim> {
    // MOCK: Simular actualización
    // En producción: await api.put('/claims/${claimId}', {...})

    const claim = await this.getUserClaims('demo-user-id');
    const updatedClaim = claim.find(c => c.id === claimId);

    if (!updatedClaim) {
      throw new Error('Reclamo no encontrado');
    }

    updatedClaim.status = status;
    if (response) {
      updatedClaim.manufacturerResponse = response;
    }
    updatedClaim.updatedAt = new Date().toISOString();

    if (status === 'resolved') {
      updatedClaim.resolvedAt = new Date().toISOString();
    }

    return updatedClaim;
  }

  /**
   * Subir evidencia (fotos/videos) a un reclamo
   */
  static async uploadEvidence(
    claimId: string,
    type: 'photo' | 'video',
    uri: string
  ): Promise<string> {
    // MOCK: Simular upload a S3/CloudFlare
    // En producción: Upload real y retornar URL

    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockUrl = `https://storage.warranty-wallet.com/${type}s/${claimId}-${Date.now()}.${type === 'photo' ? 'jpg' : 'mp4'}`;

    return mockUrl;
  }

  /**
   * Obtener información de contacto del fabricante
   */
  static async getManufacturerContact(manufacturerId: string): Promise<Manufacturer> {
    // MOCK: Base de datos de fabricantes
    // En producción: await api.get('/manufacturers/${manufacturerId}')

    const manufacturers: { [key: string]: Manufacturer } = {
      'samsung': {
        id: 'samsung',
        name: 'Samsung Electronics',
        logo: 'https://logo.clearbit.com/samsung.com',
        contactPhone: '+34 902 404 040',
        supportEmail: 'soporte@samsung.es',
        website: 'https://www.samsung.com/es/support/',
        warrantyInfo: 'Garantía de 24 meses en productos electrónicos'
      },
      'apple': {
        id: 'apple',
        name: 'Apple Inc.',
        logo: 'https://logo.clearbit.com/apple.com',
        contactPhone: '+34 900 150 503',
        supportEmail: 'soporte@apple.com',
        website: 'https://support.apple.com/es-es',
        warrantyInfo: 'Garantía limitada de 1 año, extensible con AppleCare+'
      },
      'lg': {
        id: 'lg',
        name: 'LG Electronics',
        logo: 'https://logo.clearbit.com/lg.com',
        contactPhone: '+34 902 500 234',
        supportEmail: 'servicio.atencion.cliente@lge.com',
        website: 'https://www.lg.com/es/soporte',
        warrantyInfo: 'Garantía de 24 meses en electrodomésticos'
      }
    };

    return manufacturers[manufacturerId] || {
      id: 'unknown',
      name: 'Fabricante Desconocido',
      warrantyInfo: 'Consulta el ticket de compra para información de garantía'
    };
  }

  /**
   * Obtener estadísticas de reclamos
   */
  static async getClaimStats(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    rejected: number;
    averageResolutionDays: number;
  }> {
    const claims = await this.getUserClaims(userId);

    const stats = {
      total: claims.length,
      pending: claims.filter(c => c.status === 'pending').length,
      inProgress: claims.filter(c => c.status === 'in_progress').length,
      resolved: claims.filter(c => c.status === 'resolved').length,
      rejected: claims.filter(c => c.status === 'rejected').length,
      averageResolutionDays: 0
    };

    // Calcular tiempo promedio de resolución
    const resolvedClaims = claims.filter(c => c.resolvedAt);
    if (resolvedClaims.length > 0) {
      const totalDays = resolvedClaims.reduce((sum, claim) => {
        const created = new Date(claim.createdAt);
        const resolved = new Date(claim.resolvedAt!);
        const days = Math.floor((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);

      stats.averageResolutionDays = Math.round(totalDays / resolvedClaims.length);
    }

    return stats;
  }
}
