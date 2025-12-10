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
  const iv = CryptoJS.lib.WordArray.random(16);

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
  const passwordSalt = salt || CryptoJS.lib.WordArray.random(16).toString();
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
 */
export const generateTenantId = (): string => {
  const timestamp = Date.now().toString();
  const random = CryptoJS.lib.WordArray.random(8).toString();
  return CryptoJS.SHA256(timestamp + random).toString().substring(0, 32);
};

/**
 * Genera un ID único para tickets y productos
 */
export const generateUniqueId = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
};
