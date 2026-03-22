/**
 * Authentication Module - Main Export
 *
 * Provides complete authentication and authorization for Comoon
 * Built for Cloudflare Workers + Hono + Astro
 */

// Types
export * from './types';

// JWT Functions
export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  extractTokenFromHeader,
  extractTokenFromCookie,
  payloadToSession,
  isTokenExpiringSoon,
  getTokenRemainingTime,
  createAuthCookie,
  createLogoutCookie,
  getAuthCookieOptions,
} from './jwt';

// Password Functions
export { hashPassword, verifyPassword, validatePassword, needsRehash } from './password';

// Permissions
export {
  getRolePermissions,
  hasPermission,
  createPermissionChecker,
  getDashboardPath,
  getDefaultLandingPage,
  canAccessRoute,
  ROLE_DISPLAY_NAMES,
  ROLE_COLORS,
} from './permissions';

// Middleware
export {
  authMiddleware,
  requireAuth,
  requireRole,
  requirePermission,
  requireOwnership,
  authCors,
  authLogger,
} from './middleware';
