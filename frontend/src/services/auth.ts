import { apiClient } from './api';
import type { LoginCredentials, RegisterData, AuthResponse, User, DemoCredentials } from '../types/auth';

const TOKEN_KEY = 'placementiq_jwt_token';

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || token === 'undefined' || token === 'null' || token.trim().length <= 10) {
    return null;
  }
  return token.trim();
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  if (response.data.access_token) {
    setAuthToken(response.data.access_token);
  }
  return response.data;
};

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  if (response.data.access_token) {
    setAuthToken(response.data.access_token);
  }
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

export const fetchDemoCredentials = async (): Promise<{ student: DemoCredentials; admin: DemoCredentials }> => {
  const response = await apiClient.get('/auth/demo-credentials');
  return response.data;
};

export const requestPasswordResetOTP = async (email: string): Promise<any> => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordWithOTP = async (payload: {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}): Promise<any> => {
  const response = await apiClient.post('/auth/reset-password', payload);
  return response.data;
};
