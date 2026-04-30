export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  expiresAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}
