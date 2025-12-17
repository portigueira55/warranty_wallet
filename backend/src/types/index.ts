import { Request } from 'express';

// Tipos de autenticación
export interface AuthUser {
  id: string;
  email: string;
  type: 'user' | 'manufacturer' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Tipos de login/registro
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  phone?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'user' | 'manufacturer' | 'admin';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username?: string;
    name?: string;
    type: string;
  };
}

// Tipos de warranty
export interface CreateWarrantyData {
  storeName?: string;
  storeAddress?: string;
  ticketNumber?: string;
  purchaseDate: string;
  purchaseTime?: string;
  totalAmount?: number;
  ticketImageUrl?: string;
  items: WarrantyItemData[];
}

export interface WarrantyItemData {
  productId?: string;
  sku?: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  warrantyEndDate: string;
  serialNumber?: string;
}

// Tipos de claim
export interface CreateClaimData {
  warrantyItemId: string;
  issueDescription: string;
  photos?: string[];
  videos?: string[];
}

export interface UpdateClaimData {
  status?: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  manufacturerResponse?: string;
}

// Tipos de respuesta API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Tipos de filtros
export interface QueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
