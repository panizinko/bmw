export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
