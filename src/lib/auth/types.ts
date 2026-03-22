/**
 * Authentication Types for Comoon
 *
 * Implements RBAC (Role-Based Access Control) with hierarchical inheritance
 * Following patterns from: https://hono.dev/docs/middleware/builtin/jwt
 */

// User roles in the system
export type UserRole = 'admin' | 'leader' | 'entrepreneur';

// Permission actions
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Resources in the system
export type Resource =
  | 'users'
  | 'leaders'
  | 'entrepreneurs'
  | 'causes'
  | 'products'
  | 'cause_updates'
  | 'transactions'
  | 'dashboard'
  | 'feed'
  | 'admin';

// Permission definition
export interface Permission {
  action: PermissionAction;
  resource: Resource;
  own?: boolean; // If true, can only act on own resources
}

// JWT Payload structure
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  profileId?: number; // Leader/Entrepreneur ID
  onboardingComplete?: boolean;
  iat: number; // Issued at
  exp: number; // Expiration
  iss: string; // Issuer
}

// User session data
export interface UserSession {
  id: number;
  email: string;
  role: UserRole;
  profileId?: number;
  profileType?: 'leader' | 'entrepreneur';
  name?: string;
  onboardingComplete?: boolean;
  isVerified: boolean;
  isActive: boolean;
}

// Auth context passed to routes
export interface AuthContext {
  user: UserSession | null;
  isAuthenticated: boolean;
  hasPermission: (action: PermissionAction, resource: Resource) => boolean;
  requirePermission: (action: PermissionAction, resource: Resource) => void;
}

// Login request/response
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: UserSession;
  error?: string;
  redirectTo?: string;
}

// Register request/response
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  name: string;
  // Role-specific fields
  storeName?: string; // For entrepreneurs
  location?: string;
  bio?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  userId?: number;
}

// Token refresh
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token?: string;
  error?: string;
}

// Password reset
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Database user record
export interface DBUser {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  profile_id: number | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Extended user with profile info
export interface DBUserWithProfile extends DBUser {
  name?: string;
  photo_url?: string;
  location?: string;
  store_name?: string; // For entrepreneurs
}
