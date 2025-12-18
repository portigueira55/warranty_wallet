import CryptoJS from 'crypto-js';
import { EncryptedData } from '../types';

// Clave secreta para cifrado - En producción usar variables de entorno
const SECRET_KEY = 'WW_S3CR3T_K3Y_2024_PR0DUCT10N';
const TENANT_SALT = 'WW_T3N4NT_S4LT';

/**
 * Genera una clave derivada del tenant para aislamiento de datos
 */
export const deriveTenantKey = (tenantId: string): string => {
  return CryptoJS.PBKDF2(tenantId, TENANT_SALT, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
};

/**
 * Cifra datos sensibles con AES-256
 */
export const encryptData = (data: string, tenantId?: string): EncryptedData => {
  const key = tenantId ? deriveTenantKey(tenantId) : SECRET_KEY;
  // Generar IV sin usar crypto.random
  const ivStr = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const iv = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(ivStr).toString().substring(0, 32));

  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    data: encrypted.toString()
  };
};

/**
 * Descifra datos con AES-256
 */
export const decryptData = (encryptedData: EncryptedData, tenantId?: string): string => {
  try {
    const key = tenantId ? deriveTenantKey(tenantId) : SECRET_KEY;
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);

    const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error al descifrar:', error);
    return '';
  }
};

/**
 * Hash de contraseña con SHA-256 y salt
 */
export const hashPassword = (password: string, salt?: string): string => {
  const passwordSalt = salt || (Math.random().toString(36) + Math.random().toString(36) + Date.now().toString(36));
  const hash = CryptoJS.SHA256(password + passwordSalt).toString();
  return `${passwordSalt}:${hash}`;
};

/**
 * Verifica contraseña hasheada
 */
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [salt, hash] = hashedPassword.split(':');
  const newHash = CryptoJS.SHA256(password + salt).toString();
  return hash === newHash;
};

/**
 * Genera un ID único cifrado para el tenant
 * Usa timestamp + random para evitar dependencia de crypto nativo
 */
export const generateTenantId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  return CryptoJS.SHA256(timestamp + random).toString().substring(0, 32);
};

/**
 * Genera un ID único para tickets y productos
 * Usa timestamp + random para evitar dependencia de crypto nativo
 */
export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}${randomPart2}`;
};
