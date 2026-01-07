export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

export interface Warranty {
  id: number;
  user_id: number;
  product_name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date: string;
  warranty_duration: number; // months
  expiry_date: string;
  category?: string;
  store?: string;
  price?: number;
  receipt_image?: string;
  product_image?: string;
  notes?: string;
  status: 'active' | 'expired' | 'claimed';
  created_at: string;
  updated_at: string;
}

export interface WarrantyStats {
  total: number;
  active: number;
  expiring_soon: number; // within 30 days
  expired: number;
  total_value: number;
}

export interface Notification {
  id: number;
  user_id: number;
  warranty_id?: number;
  type: 'expiring' | 'expired' | 'reminder' | 'info';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
}
