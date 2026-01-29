/**
 * Shared Authentication Types
 *
 * Contains type definitions shared between AuthService and authStore
 */

// ==================== User Types ====================

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  groups: Array<{ id: number; name: string }>;
  role?: {
    id: number;
    role_name: string;
    role_type: string;
    parent?: number | null;
    is_peer_visible: boolean;
    description?: string;
  };
  phone?: string;
  department?: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
  is_active?: boolean;
}

// Alias for backward compatibility with AuthService
export type UserProfile = User;

// ==================== Token Types ====================

export interface UserToken {
  access: string;
  refresh: string;
}

// ==================== Request/Response Types ====================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface PasswordChangeRequest {
  newPassword: string;
  currentPassword: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
}

export interface ProfileUpdateData {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
}

// ==================== Error Types ====================

export class AuthError extends Error {
  url?: string;
  status?: number;
  statusText?: string;
  body?: unknown;

  constructor(
    message: string,
    url?: string,
    status?: number,
    statusText?: string,
    body?: unknown
  ) {
    super(message);
    this.name = "AuthError";
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.body = body;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}

// ==================== Response Types ====================

export interface AuthResponse {
  status: boolean;
  errorMsg?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ProfileUpdateResponse {
  message: string;
  user: User;
}
