/**
 * JWT Token Management for Cloudflare Workers
 *
 * Using Hono's JWT helper for compatibility with Cloudflare Workers
 * Reference: https://hono.dev/docs/helpers/jwt
 */

import { sign, verify, decode } from 'hono/jwt';
import type { JWTPayload, UserSession, UserRole } from './types';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds
const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds
const REMEMBER_ME_EXPIRY = 60 * 60 * 24 * 30; // 30 days in seconds

// JWT Issuer
const JWT_ISSUER = 'comoon';

/**
 * Generate an access token for a user
 */
export async function generateAccessToken(
  user: UserSession,
  secret: string,
  rememberMe: boolean = false,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = rememberMe ? REMEMBER_ME_EXPIRY : ACCESS_TOKEN_EXPIRY;

  const payload: JWTPayload = {
    sub: String(user.id),
    email: user.email,
    role: user.role,
    profileId: user.profileId,
    onboardingComplete: user.onboardingComplete || false,
    iat: now,
    exp: now + expiry,
    iss: JWT_ISSUER,
  };

  return await sign(payload, secret);
}

/**
 * Generate a refresh token
 */
export async function generateRefreshToken(userId: number, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    sub: String(userId),
    type: 'refresh',
    iat: now,
    exp: now + REFRESH_TOKEN_EXPIRY,
    iss: JWT_ISSUER,
  };

  return await sign(payload, secret);
}

/**
 * Verify and decode an access token
 */
export async function verifyAccessToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const payload = (await verify(token, secret, 'HS256')) as JWTPayload;

    // Verify issuer
    if (payload.iss !== JWT_ISSUER) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[JWT] Verify error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(
  token: string,
  secret: string,
): Promise<{ userId: number } | null> {
  try {
    const payload = (await verify(token, secret, 'HS256')) as {
      sub: string;
      type: string;
      iss: string;
    };

    if (payload.type !== 'refresh' || payload.iss !== JWT_ISSUER) {
      return null;
    }

    return { userId: parseInt(payload.sub, 10) };
  } catch (error) {
    return null;
  }
}

/**
 * Decode a token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const { payload } = decode(token);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  // Support both "Bearer <token>" and just "<token>"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return authHeader;
}

/**
 * Extract token from cookie
 */
export function extractTokenFromCookie(
  cookieHeader: string | null,
  cookieName: string = 'auth_token',
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );

  return cookies[cookieName] || null;
}

/**
 * Create a session object from JWT payload
 */
export function payloadToSession(payload: JWTPayload): UserSession {
  return {
    id: parseInt(payload.sub, 10),
    email: payload.email,
    role: payload.role,
    profileId: payload.profileId,
    onboardingComplete: payload.onboardingComplete || false,
    isVerified: true, // If token is valid, user is verified
    isActive: true,
  };
}

/**
 * Check if a token is about to expire (within 5 minutes)
 */
export function isTokenExpiringSoon(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  return payload.exp - now < fiveMinutes;
}

/**
 * Get remaining token lifetime in seconds
 */
export function getTokenRemainingTime(payload: JWTPayload): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}

/**
 * Generate auth cookie options
 */
export function getAuthCookieOptions(rememberMe: boolean = false): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: false, // Set to true in production (Cloudflare handles HTTPS)
    sameSite: 'Lax',
    path: '/',
    maxAge: rememberMe ? REMEMBER_ME_EXPIRY : ACCESS_TOKEN_EXPIRY,
  };
}

/**
 * Create Set-Cookie header value
 */
export function createAuthCookie(
  token: string,
  rememberMe: boolean = false,
  cookieName: string = 'auth_token',
): string {
  const options = getAuthCookieOptions(rememberMe);
  const parts = [
    `${cookieName}=${token}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    options.httpOnly ? 'HttpOnly' : '',
    options.secure ? 'Secure' : '',
    `SameSite=${options.sameSite}`,
  ].filter(Boolean);

  return parts.join('; ');
}

/**
 * Create logout cookie (expires immediately)
 */
export function createLogoutCookie(cookieName: string = 'auth_token'): string {
  return `${cookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}
