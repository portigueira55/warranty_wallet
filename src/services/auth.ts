import { User } from '../types';
import { UserStorage } from './storage';
import {
  hashPassword,
  verifyPassword,
  generateTenantId,
  generateUniqueId
} from '../utils/encryption';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CREDENTIALS_KEY = 'ww_credentials';

interface StoredCredentials {
  username: string;
  passwordHash: string;
  userId: string;
  tenantId: string;
}

/**
 * Servicio de autenticación con cifrado
 */
export class AuthService {

  /**
   * Inicializa el usuario demo admin
   */
  static async initializeDemoUser(): Promise<void> {
    const credentials = await this.getCredentials();
    const adminExists = credentials.some(c => c.username === 'admin');

    if (!adminExists) {
      const tenantId = generateTenantId();
      const userId = generateUniqueId();

      const adminUser: User = {
        id: userId,
        username: 'admin',
        email: 'admin@warrantywallet.com',
        role: 'admin',
        tenantId: tenantId,
        createdAt: new Date().toISOString()
      };

      const adminCredentials: StoredCredentials = {
        username: 'admin',
        passwordHash: hashPassword('1234'),
        userId: userId,
        tenantId: tenantId
      };

      await UserStorage.saveUser(adminUser);
      await this.saveCredentials([...credentials, adminCredentials]);

      console.log('Usuario demo admin creado exitosamente');
    }
  }

  /**
   * Guarda credenciales
   */
  private static async saveCredentials(credentials: StoredCredentials[]): Promise<void> {
    await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  }

  /**
   * Obtiene credenciales
   */
  private static async getCredentials(): Promise<StoredCredentials[]> {
    try {
      const stored = await AsyncStorage.getItem(CREDENTIALS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Login de usuario
   */
  static async login(username: string, password: string): Promise<User | null> {
    try {
      // CREDENCIALES HARDCODEADAS PARA ADMIN (siempre disponibles, no requieren AsyncStorage)
      if (username === 'admin' && password === '1234') {
        const adminUser: User = {
          id: 'admin-default-id',
          username: 'admin',
          email: 'admin@warrantywallet.com',
          role: 'admin',
          tenantId: 'admin-tenant',
          createdAt: new Date().toISOString()
        };
        await UserStorage.setCurrentUser(adminUser);
        return adminUser;
      }

      const credentials = await this.getCredentials();
      const userCreds = credentials.find(c => c.username === username);

      if (!userCreds) {
        console.log('Usuario no encontrado');
        return null;
      }

      const isValid = verifyPassword(password, userCreds.passwordHash);

      if (!isValid) {
        console.log('Contraseña incorrecta');
        return null;
      }

      const user = await UserStorage.getUserByUsername(username);

      if (user) {
        await UserStorage.setCurrentUser(user);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    }
  }

  /**
   * Logout de usuario
   */
  static async logout(): Promise<void> {
    await UserStorage.clearCurrentUser();
  }

  /**
   * Registro de nuevo usuario
   */
  static async register(
    username: string,
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const credentials = await this.getCredentials();
      const exists = credentials.some(c => c.username === username);

      if (exists) {
        console.log('El usuario ya existe');
        return null;
      }

      const tenantId = generateTenantId();
      const userId = generateUniqueId();

      const newUser: User = {
        id: userId,
        username,
        email,
        role: 'user',
        tenantId,
        createdAt: new Date().toISOString()
      };

      const newCredentials: StoredCredentials = {
        username,
        passwordHash: hashPassword(password),
        userId,
        tenantId
      };

      await UserStorage.saveUser(newUser);
      await this.saveCredentials([...credentials, newCredentials]);
      await UserStorage.setCurrentUser(newUser);

      return newUser;
    } catch (error) {
      console.error('Error en registro:', error);
      return null;
    }
  }

  /**
   * Verifica si hay sesión activa
   */
  static async checkSession(): Promise<User | null> {
    return await UserStorage.getCurrentUser();
  }

  /**
   * Cambia contraseña
   */
  static async changePassword(
    username: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const credentials = await this.getCredentials();
      const userCredsIndex = credentials.findIndex(c => c.username === username);

      if (userCredsIndex === -1) {
        return false;
      }

      const isValid = verifyPassword(oldPassword, credentials[userCredsIndex].passwordHash);

      if (!isValid) {
        return false;
      }

      credentials[userCredsIndex].passwordHash = hashPassword(newPassword);
      await this.saveCredentials(credentials);

      return true;
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      return false;
    }
  }
}
