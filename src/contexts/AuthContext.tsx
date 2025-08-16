import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, LoginResponse } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    try {
      const response: LoginResponse = await apiService.login(email, password);
      
      // Store token in localStorage
      localStorage.setItem('authToken', response.token);
      
      // Set user state
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    
    // Clear user state
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await apiService.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Auth check error:', error);
      // If token is invalid, remove it and clear user
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
