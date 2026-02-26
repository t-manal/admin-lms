export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string; // Usage in header.tsx
  role: UserRole;
  bio?: string | null;
  phone?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}


export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
