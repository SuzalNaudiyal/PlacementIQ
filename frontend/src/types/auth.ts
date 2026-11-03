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
  username: string;
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
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

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  email: string;
  otp_debug?: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthMessageResponse {
  message: string;
  success: boolean;
}
