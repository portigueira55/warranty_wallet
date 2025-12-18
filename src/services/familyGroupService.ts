import { FamilyGroup, FamilyMember, Ticket, User } from '../types';

/**
 * Servicio de gestión de grupos familiares
 * Permite compartir garantías entre miembros de una familia
 */

export class FamilyGroupService {
  /**
   * Crear un nuevo grupo familiar
   */
  static async createGroup(
    ownerId: string,
    groupName: string,
    description?: string
  ): Promise<FamilyGroup> {
    // MOCK: Simular creación de grupo
    // En producción: await api.post('/family-groups', { ownerId, groupName, description })

    await new Promise(resolve => setTimeout(resolve, 800));

    const newGroup: FamilyGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      description,
      ownerId,
      members: [
        {
          userId: ownerId,
          name: 'Usuario Principal',
          email: 'usuario@email.com',
          role: 'owner',
          joinedAt: new Date().toISOString(),
          canAddWarranties: true,
          canViewWarranties: true,
          canEditWarranties: true
        }
      ],
      sharedWarranties: [],
      createdAt: new Date().toISOString()
    };

    return newGroup;
  }

  /**
   * Invitar a un miembro al grupo
   */
  static async inviteMember(
    groupId: string,
    userEmail: string,
    role: 'admin' | 'member' = 'member',
    permissions?: {
      canAddWarranties?: boolean;
      canViewWarranties?: boolean;
      canEditWarranties?: boolean;
    }
  ): Promise<{
    success: boolean;
    message: string;
    invitation?: {
      id: string;
      groupId: string;
      invitedEmail: string;
      status: 'pending';
      expiresAt: string;
    };
  }> {
    // MOCK: Simular invitación
    // En producción: await api.post(`/family-groups/${groupId}/invite`, { userEmail, role, permissions })

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular búsqueda de usuario
    const userExists = userEmail.includes('@');

    if (!userExists) {
      return {
        success: false,
        message: 'Email inválido'
      };
    }

    return {
      success: true,
      message: 'Invitación enviada correctamente',
      invitation: {
        id: `inv-${Date.now()}`,
        groupId,
        invitedEmail: userEmail,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
      }
    };
  }

  /**
   * Obtener todos los grupos del usuario
   */
  static async getUserGroups(userId: string): Promise<FamilyGroup[]> {
    // MOCK: Simular obtención de grupos
    // En producción: await api.get(`/users/${userId}/family-groups`)

    await new Promise(resolve => setTimeout(resolve, 600));

    // Grupo familiar de ejemplo
    const mockGroups: FamilyGroup[] = [
      {
        id: 'group-123',
        name: 'Familia García',
        description: 'Garantías compartidas de la familia',
        ownerId: userId,
        members: [
          {
            userId: userId,
            name: 'Juan García',
            email: 'juan@email.com',
            role: 'owner',
            joinedAt: '2024-01-15T10:00:00Z',
            canAddWarranties: true,
            canViewWarranties: true,
            canEditWarranties: true
          },
          {
            userId: 'user-456',
            name: 'María García',
            email: 'maria@email.com',
            role: 'admin',
            joinedAt: '2024-01-16T14:30:00Z',
            canAddWarranties: true,
            canViewWarranties: true,
            canEditWarranties: true
          },
          {
            userId: 'user-789',
            name: 'Pedro García',
            email: 'pedro@email.com',
            role: 'member',
            joinedAt: '2024-02-01T09:15:00Z',
            canAddWarranties: false,
            canViewWarranties: true,
            canEditWarranties: false
          }
        ],
        sharedWarranties: ['ticket-1', 'ticket-2', 'ticket-5'],
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    return mockGroups;
  }

  /**
   * Compartir una garantía con el grupo
   */
  static async shareWarrantyWithGroup(
    ticketId: string,
    groupId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // MOCK: Simular compartir garantía
    // En producción: await api.post(`/family-groups/${groupId}/share`, { ticketId, userId })

    await new Promise(resolve => setTimeout(resolve, 800));

    // Verificar permisos (mock)
    const hasPermission = true; // En producción verificar si el usuario puede compartir

    if (!hasPermission) {
      return {
        success: false,
        message: 'No tienes permisos para compartir garantías en este grupo'
      };
    }

    return {
      success: true,
      message: 'Garantía compartida con el grupo correctamente'
    };
  }

  /**
   * Dejar de compartir una garantía
   */
  static async unshareWarranty(
    ticketId: string,
    groupId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // MOCK: Simular dejar de compartir
    // En producción: await api.delete(`/family-groups/${groupId}/share/${ticketId}`)

    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Garantía eliminada del grupo'
    };
  }

  /**
   * Obtener todas las garantías compartidas en un grupo
   */
  static async getGroupWarranties(groupId: string): Promise<Ticket[]> {
    // MOCK: Simular obtención de garantías del grupo
    // En producción: await api.get(`/family-groups/${groupId}/warranties`)

    await new Promise(resolve => setTimeout(resolve, 700));

    // En producción, esto devolvería las garantías reales del grupo
    // Por ahora devolvemos un array vacío
    return [];
  }

  /**
   * Eliminar miembro del grupo
   */
  static async removeMember(
    groupId: string,
    userId: string,
    requesterId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // MOCK: Simular eliminación de miembro
    // En producción: await api.delete(`/family-groups/${groupId}/members/${userId}`, { requesterId })

    await new Promise(resolve => setTimeout(resolve, 600));

    // Verificar que el requester sea owner o admin
    const hasPermission = true; // Mock

    if (!hasPermission) {
      return {
        success: false,
        message: 'Solo el propietario o administradores pueden eliminar miembros'
      };
    }

    return {
      success: true,
      message: 'Miembro eliminado del grupo'
    };
  }

  /**
   * Actualizar permisos de un miembro
   */
  static async updateMemberPermissions(
    groupId: string,
    userId: string,
    permissions: {
      canAddWarranties?: boolean;
      canViewWarranties?: boolean;
      canEditWarranties?: boolean;
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // MOCK: Simular actualización de permisos
    // En producción: await api.patch(`/family-groups/${groupId}/members/${userId}/permissions`, permissions)

    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Permisos actualizados correctamente'
    };
  }

  /**
   * Salir de un grupo familiar
   */
  static async leaveGroup(
    groupId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // MOCK: Simular salida del grupo
    // En producción: await api.post(`/family-groups/${groupId}/leave`, { userId })

    await new Promise(resolve => setTimeout(resolve, 500));

    // Verificar si es el owner
    const isOwner = false; // Mock

    if (isOwner) {
      return {
        success: false,
        message: 'El propietario no puede salir del grupo. Elimina el grupo o transfiere la propiedad primero.'
      };
    }

    return {
      success: true,
      message: 'Has salido del grupo correctamente'
    };
  }

  /**
   * Eliminar grupo completo (solo owner)
   */
  static async deleteGroup(
    groupId: string,
    ownerId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // MOCK: Simular eliminación de grupo
    // En producción: await api.delete(`/family-groups/${groupId}`, { ownerId })

    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      message: 'Grupo eliminado correctamente'
    };
  }
}
