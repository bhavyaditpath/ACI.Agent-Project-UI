export enum UserRole {
  Admin = 'Admin',
  Viewer = 'Viewer'
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: UserRole;
  expiresAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}
