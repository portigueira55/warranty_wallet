import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptData, decryptData } from '../utils/encryption';
import { User, Ticket, EncryptedData } from '../types';

const STORAGE_KEYS = {
  USERS: 'ww_users',
  CURRENT_USER: 'ww_current_user',
  TICKETS: 'ww_tickets',
  SESSION: 'ww_session'
};

/**
 * Servicio de almacenamiento seguro con cifrado por tenant
 */
export class SecureStorage {

  /**
   * Guarda datos cifrados
   */
  static async setEncrypted(key: string, data: any, tenantId?: string): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      const encrypted = encryptData(jsonData, tenantId);
      await AsyncStorage.setItem(key, JSON.stringify(encrypted));
    } catch (error) {
      console.error('Error guardando datos cifrados:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos descifrados
   */
  static async getEncrypted<T>(key: string, tenantId?: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;

      const encrypted: EncryptedData = JSON.parse(stored);
      const decrypted = decryptData(encrypted, tenantId);

      if (!decrypted) return null;
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Error obteniendo datos cifrados:', error);
      return null;
    }
  }

  /**
   * Guarda datos sin cifrar (para datos no sensibles)
   */
  static async set(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando datos:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos sin cifrar
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;
      return JSON.parse(stored) as T;
    } catch (error) {
      console.error('Error obteniendo datos:', error);
      return null;
    }
  }

  /**
   * Elimina datos
   */
  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error eliminando datos:', error);
      throw error;
    }
  }

  /**
   * Limpia todo el almacenamiento
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error limpiando almacenamiento:', error);
      throw error;
    }
  }
}

/**
 * Servicio específico para usuarios
 */
export class UserStorage {

  static async saveUser(user: User): Promise<void> {
    const users = await this.getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    await SecureStorage.setEncrypted(STORAGE_KEYS.USERS, users);
  }

  static async getAllUsers(): Promise<User[]> {
    const users = await SecureStorage.getEncrypted<User[]>(STORAGE_KEYS.USERS);
    return users || [];
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.username === username) || null;
  }

  static async setCurrentUser(user: User): Promise<void> {
    await SecureStorage.setEncrypted(STORAGE_KEYS.CURRENT_USER, user, user.tenantId);
  }

  static async getCurrentUser(): Promise<User | null> {
    // Primero obtenemos sin tenant para saber quién está logueado
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!stored) return null;

    try {
      const encrypted: EncryptedData = JSON.parse(stored);
      // Intentamos descifrar con diferentes tenants conocidos
      const users = await this.getAllUsers();

      for (const user of users) {
        const decrypted = decryptData(encrypted, user.tenantId);
        if (decrypted) {
          try {
            return JSON.parse(decrypted) as User;
          } catch {
            continue;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  static async clearCurrentUser(): Promise<void> {
    await SecureStorage.remove(STORAGE_KEYS.CURRENT_USER);
  }
}

/**
 * Servicio específico para tickets
 */
export class TicketStorage {

  private static getTicketKey(tenantId: string): string {
    return `${STORAGE_KEYS.TICKETS}_${tenantId}`;
  }

  static async saveTicket(ticket: Ticket): Promise<void> {
    const tickets = await this.getTicketsByTenant(ticket.tenantId);
    const existingIndex = tickets.findIndex(t => t.id === ticket.id);

    if (existingIndex >= 0) {
      tickets[existingIndex] = { ...ticket, updatedAt: new Date().toISOString() };
    } else {
      tickets.push(ticket);
    }

    await SecureStorage.setEncrypted(
      this.getTicketKey(ticket.tenantId),
      tickets,
      ticket.tenantId
    );
  }

  static async getTicketsByTenant(tenantId: string): Promise<Ticket[]> {
    const tickets = await SecureStorage.getEncrypted<Ticket[]>(
      this.getTicketKey(tenantId),
      tenantId
    );
    return tickets || [];
  }

  static async getTicketsByUser(userId: string, tenantId: string): Promise<Ticket[]> {
    const tickets = await this.getTicketsByTenant(tenantId);
    return tickets.filter(t => t.userId === userId);
  }

  static async deleteTicket(ticketId: string, tenantId: string): Promise<void> {
    const tickets = await this.getTicketsByTenant(tenantId);
    const filtered = tickets.filter(t => t.id !== ticketId);

    await SecureStorage.setEncrypted(
      this.getTicketKey(tenantId),
      filtered,
      tenantId
    );
  }
}
