// Tipos principales de la aplicación

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  tenantId: string;
  phone?: string;
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
  // Nuevos campos
  category?: string;
  familyGroupId?: string;
  transferHistory?: TransferRecord[];
  additionalPhotos?: string[];
  additionalVideos?: string[];
  manualUrl?: string;
  isExtended?: boolean;
  extendedUntil?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  price?: number;
  // Nuevos campos
  serialNumber?: string;
  ean?: string;
  asin?: string;
  category?: string;
  manufacturerId?: string;
  imageUrl?: string;
  manualUrl?: string;
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

// Nuevos tipos para funcionalidades avanzadas

export interface TransferRecord {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  transferDate: string;
  reason?: string;
}

export interface WarrantyClaim {
  id: string;
  ticketId: string;
  productId: string;
  userId: string;
  issueDescription: string;
  caseNumber?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'resolved';
  photos?: string[];
  videos?: string[];
  manufacturerResponse?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  logo?: string;
  contactPhone?: string;
  supportEmail?: string;
  website?: string;
  warrantyInfo?: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: FamilyMember[];
  sharedWarranties?: string[];
  createdAt: string;
}

export interface FamilyMember {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  canAddWarranties?: boolean;
  canViewWarranties?: boolean;
  canEditWarranties?: boolean;
}

export interface WarrantyExtension {
  id: string;
  ticketId: string;
  productId: string;
  provider: string;
  providerId: string;
  purchaseDate: string;
  startDate: string;
  endDate: string;
  cost: number;
  coverage: string[];
  policyNumber: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  claimLimit: number | null;
  claimsUsed: number;
  terms?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface ProductInfo {
  ean?: string;
  asin?: string;
  name: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  manualUrl?: string;
  averagePrice?: number;
  manufacturer?: Manufacturer;
}

export interface ResaleValue {
  originalPrice: number;
  currentValue: number;
  depreciationRate: number;
  warrantyValueBonus: number;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  estimatedResalePrice: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}
