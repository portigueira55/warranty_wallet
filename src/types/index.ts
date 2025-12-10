// Tipos principales de la aplicación

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  tenantId: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  tenantId: string;
  imageUri: string;
  purchaseDate: string;
  ticketNumber: string;
  purchaseTime: string;
  storeName: string;
  storeAddress?: string;
  products: Product[];
  warrantyEndDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OCRResult {
  purchaseDate?: string;
  ticketNumber?: string;
  purchaseTime?: string;
  storeName?: string;
  storeAddress?: string;
  products?: Partial<Product>[];
  total?: number;
  rawText: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface EncryptedData {
  iv: string;
  data: string;
}
