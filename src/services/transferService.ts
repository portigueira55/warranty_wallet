import { Ticket, TransferRecord, User } from '../types';

/**
 * Servicio de transferencia de garantías
 * MOCK: En producción, esto se conectará a la API
 */

export class TransferService {
  /**
   * Buscar usuario por email o teléfono para transferir
   */
  static async searchUser(query: string): Promise<User[]> {
    // MOCK: Simular búsqueda de usuarios
    // En producción: await api.get(`/users/search?q=${query}`)

    const mockUsers: User[] = [
      {
        id: 'user-2',
        username: 'maria.garcia',
        name: 'María García',
        email: 'maria@example.com',
        phone: '+34 600 123 456',
        role: 'user',
        tenantId: 'demo-tenant',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-3',
        username: 'juan.perez',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '+34 600 789 012',
        role: 'user',
        tenantId: 'demo-tenant',
        createdAt: new Date().toISOString()
      }
    ];

    return mockUsers.filter(u =>
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      (u.phone && u.phone.includes(query))
    );
  }

  /**
   * Transferir garantía a otro usuario
   */
  static async transferWarranty(
    ticketId: string,
    fromUserId: string,
    toUserId: string,
    reason?: string
  ): Promise<{success: boolean; message: string; transferRecord?: TransferRecord}> {
    // MOCK: Simular transferencia
    // En producción: await api.post('/warranties/transfer', {...})

    try {
      const transferRecord: TransferRecord = {
        id: `transfer-${Date.now()}`,
        fromUserId,
        fromUserName: 'Usuario Demo',
        toUserId,
        toUserName: 'Usuario Receptor',
        transferDate: new Date().toISOString(),
        reason
      };

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Garantía transferida correctamente. El nuevo propietario recibirá una notificación.',
        transferRecord
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al transferir la garantía. Inténtalo de nuevo.'
      };
    }
  }

  /**
   * Obtener historial de transferencias de una garantía
   */
  static async getTransferHistory(ticketId: string): Promise<TransferRecord[]> {
    // MOCK: Retornar historial simulado
    // En producción: await api.get(`/warranties/${ticketId}/transfers`)

    return [
      {
        id: 'transfer-1',
        fromUserId: 'user-1',
        fromUserName: 'Carlos Ruiz',
        toUserId: 'demo-user-id',
        toUserName: 'Usuario Demo',
        transferDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Venta de producto de segunda mano'
      }
    ];
  }

  /**
   * Validar si un usuario puede transferir una garantía
   */
  static async canTransfer(ticketId: string, userId: string): Promise<boolean> {
    // Validaciones:
    // - El usuario es el dueño actual
    // - La garantía no está vencida
    // - No hay transferencias pendientes

    return true; // MOCK: Siempre permitir en demo
  }
}
