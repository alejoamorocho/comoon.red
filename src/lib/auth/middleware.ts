/**
 * Hono Authentication Middleware for Cloudflare Workers
 *
 * Provides JWT authentication and RBAC authorization
 * Reference: https://hono.dev/docs/middleware/builtin/jwt
 */

import { createMiddleware } from 'hono/factory';
import type { Context, Next } from 'hono';
import {
  verifyAccessToken,
  extractTokenFromHeader,
  extractTokenFromCookie,
  payloadToSession,
  isTokenExpiringSoon,
} from './jwt';
import { hasPermission, canAccessRoute } from './permissions';
import type { UserSession, UserRole, PermissionAction, Resource, AuthContext } from './types';

// Extend Hono context with auth
declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
    user: UserSession | null;
  }
}

// Type for bindings
type AuthBindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

/**
 * Authentication middleware - validates JWT and sets user context
 * Does NOT reject unauthenticated requests, just sets auth context
 */
export const authMiddleware = createMiddleware<{ Bindings: AuthBindings }>(async (c, next) => {
  // Fallback needed for astro dev mode where env may not propagate
  const jwtSecret: string = c.env.JWT_SECRET || 'comoon-dev-secret-change-in-production';

  // Try to get token from header first, then cookie
  const authHeader = c.req.header('Authorization');
  const cookieHeader = c.req.header('Cookie');

  let token = extractTokenFromHeader(authHeader);
  if (!token) {
    token = extractTokenFromCookie(cookieHeader);
  }

  let user: UserSession | null = null;

  if (token) {
    const payload = await verifyAccessToken(token, jwtSecret);
    if (payload) {
      user = payloadToSession(payload);

      // Check if token is expiring soon (for client to know to refresh)
      if (isTokenExpiringSoon(payload)) {
        c.header('X-Token-Expiring', 'true');
      }
    }
  }

  // Create auth context
  const auth: AuthContext = {
    user,
    isAuthenticated: user !== null,
    hasPermission: (action: PermissionAction, resource: Resource) => {
      if (!user) return false;
      return hasPermission(user.role, action, resource);
    },
    requirePermission: (action: PermissionAction, resource: Resource) => {
      if (!user) {
        throw new Error('Authentication required');
      }
      if (!hasPermission(user.role, action, resource)) {
        throw new Error('Permission denied');
      }
    },
  };

  // Set context variables
  c.set('auth', auth);
  c.set('user', user);

  await next();
});

/**
 * Require authentication middleware - rejects if not authenticated
 */
export const requireAuth = createMiddleware<{ Bindings: AuthBindings }>(async (c, next) => {
  const auth = c.get('auth');

  if (!auth?.isAuthenticated) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  await next();
});

/**
 * Require specific role(s) middleware
 */
export function requireRole(...roles: UserRole[]) {
  return createMiddleware<{ Bindings: AuthBindings }>(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (!roles.includes(user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  });
}

/**
 * Require permission middleware
 */
export function requirePermission(action: PermissionAction, resource: Resource) {
  return createMiddleware<{ Bindings: AuthBindings }>(async (c, next) => {
    const auth = c.get('auth');

    if (!auth?.isAuthenticated) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (!auth.hasPermission(action, resource)) {
      return c.json({ error: 'Permission denied' }, 403);
    }

    await next();
  });
}

/**
 * Resource ownership middleware - checks if user owns the resource
 * Admins bypass ownership checks
 */
export function requireOwnership(getResourceOwnerId: (c: Context) => Promise<number | null>) {
  return createMiddleware<{ Bindings: AuthBindings }>(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // Admins bypass ownership
    if (user.role === 'admin') {
      await next();
      return;
    }

    const ownerId = await getResourceOwnerId(c);

    if (ownerId === null) {
      return c.json({ error: 'Resource not found' }, 404);
    }

    // Check profile ID for leaders/entrepreneurs or user ID
    const userOwnerId = user.profileId || user.id;

    if (ownerId !== userOwnerId) {
      return c.json({ error: 'Permission denied' }, 403);
    }

    await next();
  });
}

// Rate limiting is handled by Cloudflare Rate Limiting Rules (WAF).
// Configure at: Cloudflare Dashboard > Security > WAF > Rate limiting rules
// Recommended rules:
//   /api/auth/login    - 5 requests per minute per IP
//   /api/auth/register - 3 requests per minute per IP
//   /api/*             - 100 requests per minute per IP

/**
 * CORS middleware for auth endpoints
 */
export const authCors = createMiddleware(async (c, next) => {
  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  await next();

  // Add CORS headers to response
  c.header('Access-Control-Allow-Origin', '*');
});

/**
 * Logging middleware for auth events
 */
export const authLogger = createMiddleware(async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;
  const user = c.get('user');

  console.log(
    `[AUTH] ${method} ${path} - ${status} - ${duration}ms - User: ${user?.email || 'anonymous'}`,
  );
});
