import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials, RegisterData, UserRole } from '../types/auth';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  getAuthToken,
  removeAuthToken,
  fetchDemoCredentials,
} from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: 'student' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const profile = await getCurrentUser();
          setUser(profile);
          setToken(storedToken);
        } catch {
          removeAuthToken();
          setUser(null);
          setToken(null);
        }
      } else {
        removeAuthToken();
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const authData = await loginUser(credentials);
      setUser(authData.user);
      setToken(authData.access_token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const authData = await registerUser(data);
      setUser(authData.user);
      setToken(authData.access_token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    removeAuthToken();
    setUser(null);
    setToken(null);
  }, []);

  const quickDemoLogin = useCallback(async (targetRole: 'student' | 'admin') => {
    setIsLoading(true);
    try {
      const credentials = await fetchDemoCredentials();
      const target = credentials[targetRole];
      const authData = await loginUser({
        email: target.email,
        password: target.password,
      });
      setUser(authData.user);
      setToken(authData.access_token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        role: user ? user.role : null,
        login,
        register,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
