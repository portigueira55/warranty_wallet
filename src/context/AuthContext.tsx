import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { AuthApiService } from '../services/authApi';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Verificar si hay sesión activa (token JWT guardado)
      const user = await AuthApiService.checkSession();

      if (user) {
        setState({
          isAuthenticated: true,
          user,
          isLoading: false
        });
      } else {
        // No hay sesión activa, mostrar pantalla de login
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error inicializando auth:', error);
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      const user = await AuthApiService.login(email, password);

      if (user) {
        setState({
          isAuthenticated: true,
          user,
          isLoading: false
        });
        return true;
      }

      setError('Credenciales inválidas');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error: any) {
      console.error('Error en login:', error);
      setError(error.message || 'Error al iniciar sesión');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthApiService.logout();
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
      setError(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      const user = await AuthApiService.register(username, email, password);

      if (user) {
        setState({
          isAuthenticated: true,
          user,
          isLoading: false
        });
        return true;
      }

      setError('Error al registrar usuario');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error: any) {
      console.error('Error en registro:', error);
      setError(error.message || 'Error al registrar usuario');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
