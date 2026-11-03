export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  created_at: string;
  is_active: boolean;
}

export interface LoginCredentials {
  email: string; // Accepts registered email OR username
  password: string;
}

export interface RegisterData {
  name: string;
  username?: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DemoCredentials {
  email: string;
  username?: string;
  password: string;
  role: UserRole;
  description: string;
}
