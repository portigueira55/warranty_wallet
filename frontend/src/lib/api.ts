import axios from 'axios';
import type {
  User,
  Warranty,
  Notification,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  WarrantyStats,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const { state } = JSON.parse(token);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
  return config;
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', credentials);
    return data;
  },
  me: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// Warranties API
export const warrantiesAPI = {
  getAll: async (): Promise<Warranty[]> => {
    const { data } = await api.get('/warranties');
    return data;
  },
  getById: async (id: number): Promise<Warranty> => {
    const { data } = await api.get(`/warranties/${id}`);
    return data;
  },
  create: async (warranty: Partial<Warranty>): Promise<Warranty> => {
    const { data } = await api.post('/warranties', warranty);
    return data;
  },
  update: async (id: number, warranty: Partial<Warranty>): Promise<Warranty> => {
    const { data} = await api.put(`/warranties/${id}`, warranty);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/warranties/${id}`);
  },
  getStats: async (): Promise<WarrantyStats> => {
    const { data } = await api.get('/warranties/stats');
    return data;
  },
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/warranties/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get('/notifications');
    return data;
  },
  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },
};

export default api;
