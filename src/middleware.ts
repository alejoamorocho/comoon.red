/**
 * Astro Middleware for Authentication
 *
 * Handles route protection and auth state on the server
 * Reference: https://docs.astro.build/en/guides/middleware/
 */

import { defineMiddleware } from 'astro:middleware';
import {
  verifyAccessToken,
  extractTokenFromCookie,
  payloadToSession,
  canAccessRoute,
  getDashboardPath,
} from './lib/auth';
import type { UserSession } from './lib/auth/types';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/store',
  '/leaders',
  '/entrepreneurs',
  '/causes',
  '/feed',
  '/404',
];

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/onboarding'];

// Onboarding routes (excluded from onboarding redirect)
const ONBOARDING_ROUTES = ['/onboarding'];

// Check if path matches any pattern
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route === path) return true;
    if (path.startsWith(route + '/')) return true;
    return false;
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, redirect, locals, url } = context;
  const path = url.pathname;

  // Skip API routes - handled by Hono middleware
  if (path.startsWith('/api')) {
    return next();
  }

  // Skip static assets
  if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return next();
  }

  // Get JWT secret from environment
  const runtime = locals.runtime;
  // Fallback needed for astro dev mode where runtime.env may not be available
  const jwtSecret: string = runtime?.env?.JWT_SECRET || 'comoon-dev-secret-change-in-production';

  // Extract token from cookie
  const cookieHeader = request.headers.get('Cookie');
  const token = extractTokenFromCookie(cookieHeader);

  let user: UserSession | null = null;

  if (token) {
    const payload = await verifyAccessToken(token, jwtSecret);
    if (payload) {
      user = payloadToSession(payload);
    }
  }

  // Set user in locals for pages to access
  locals.user = user;
  locals.isAuthenticated = user !== null;

  // Check if route requires authentication
  const isProtectedRoute = matchesRoute(path, PROTECTED_ROUTES);
  const isPublicRoute = matchesRoute(path, PUBLIC_ROUTES);

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    const loginUrl = `/login?redirect=${encodeURIComponent(path)}`;
    return redirect(loginUrl, 302);
  }

  // Redirect authenticated users from login/register
  if (user && (path === '/login' || path === '/register')) {
    if (!user.onboardingComplete) {
      return redirect('/onboarding', 302);
    }
    return redirect('/feed', 302);
  }

  // Onboarding gate: redirect non-onboarded users to /onboarding
  if (
    user &&
    !user.onboardingComplete &&
    isProtectedRoute &&
    !matchesRoute(path, ONBOARDING_ROUTES)
  ) {
    return redirect('/onboarding', 302);
  }

  // If already onboarded and visiting /onboarding, redirect to dashboard
  if (user && user.onboardingComplete && matchesRoute(path, ONBOARDING_ROUTES)) {
    return redirect(getDashboardPath(user.role), 302);
  }

  // Check role-based access for dashboard routes
  if (user && path.startsWith('/dashboard')) {
    if (!canAccessRoute(user.role, path)) {
      // Redirect to their own dashboard
      const correctDashboard = getDashboardPath(user.role);
      if (path !== correctDashboard) {
        return redirect(correctDashboard, 302);
      }
    }
  }

  return next();
});

// Type augmentation for Astro locals
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace App {
    interface Locals {
      user: UserSession | null;
      isAuthenticated: boolean;
      runtime?: {
        env: {
          DB: D1Database;
          JWT_SECRET: string;
        };
      };
    }
  }
}
