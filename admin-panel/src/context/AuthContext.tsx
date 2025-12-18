/**
 * Context de autenticación para panel de administración
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, Admin } from '../services/auth';

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay sesión activa
    if (AuthService.isAuthenticated()) {
      setIsLoading(false);
    } else {
      setAdmin(null);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await AuthService.login(email, password);
      if (user) {
        setAdmin(user);
        setIsLoading(false);
        return true;
      }
      setError('Credenciales inválidas');
      setIsLoading(false);
      return false;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    AuthService.logout();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
