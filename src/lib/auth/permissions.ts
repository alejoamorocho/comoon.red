/**
 * RBAC Permission System with Hierarchical Inheritance
 *
 * Role Hierarchy (RBAC1 Model):
 *   Admin > Leader
 *   Admin > Entrepreneur
 *
 * This means:
 * - Admin inherits all permissions from Leader and Entrepreneur
 * - Leader and Entrepreneur have independent base permissions
 *
 * Reference: https://blog.webdevsimplified.com/2025-11/rbac-vs-abac-vs-rebac/
 */

import type { UserRole, Permission, PermissionAction, Resource } from './types';

// Define base permissions for each role (without inheritance)
const BASE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Leader: Can browse, view, and manage causes/stories
  leader: [
    { action: 'read', resource: 'feed' },
    { action: 'read', resource: 'products' },
    { action: 'read', resource: 'causes' },
    { action: 'read', resource: 'cause_updates' },
    { action: 'read', resource: 'leaders' },
    { action: 'read', resource: 'entrepreneurs' },
    { action: 'read', resource: 'dashboard' },
    { action: 'create', resource: 'causes' },
    { action: 'update', resource: 'causes', own: true },
    { action: 'delete', resource: 'causes', own: true },
    { action: 'create', resource: 'cause_updates' },
    { action: 'update', resource: 'cause_updates', own: true },
    { action: 'delete', resource: 'cause_updates', own: true },
    { action: 'update', resource: 'leaders', own: true },
    { action: 'read', resource: 'transactions', own: true },
  ],

  // Entrepreneur: Can browse, view, and manage products
  entrepreneur: [
    { action: 'read', resource: 'feed' },
    { action: 'read', resource: 'products' },
    { action: 'read', resource: 'causes' },
    { action: 'read', resource: 'cause_updates' },
    { action: 'read', resource: 'leaders' },
    { action: 'read', resource: 'entrepreneurs' },
    { action: 'read', resource: 'dashboard' },
    { action: 'create', resource: 'products' },
    { action: 'update', resource: 'products', own: true },
    { action: 'delete', resource: 'products', own: true },
    { action: 'update', resource: 'entrepreneurs', own: true },
    { action: 'read', resource: 'transactions', own: true },
  ],

  // Admin: Full access to everything
  admin: [
    { action: 'manage', resource: 'users' },
    { action: 'manage', resource: 'leaders' },
    { action: 'manage', resource: 'entrepreneurs' },
    { action: 'manage', resource: 'causes' },
    { action: 'manage', resource: 'products' },
    { action: 'manage', resource: 'cause_updates' },
    { action: 'manage', resource: 'transactions' },
    { action: 'manage', resource: 'admin' },
    { action: 'manage', resource: 'dashboard' },
    { action: 'manage', resource: 'feed' },
  ],
};

// Role inheritance hierarchy
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  leader: [],
  entrepreneur: [],
  admin: ['leader', 'entrepreneur'],
};

/**
 * Get all permissions for a role including inherited ones
 */
export function getRolePermissions(role: UserRole): Permission[] {
  const permissions: Permission[] = [...BASE_PERMISSIONS[role]];

  // Add inherited permissions
  const inheritedRoles = ROLE_HIERARCHY[role];
  for (const inheritedRole of inheritedRoles) {
    // Recursively get permissions from inherited roles
    const inheritedPermissions = getRolePermissions(inheritedRole);
    permissions.push(...inheritedPermissions);
  }

  // Remove duplicates
  return deduplicatePermissions(permissions);
}

/**
 * Remove duplicate permissions
 */
function deduplicatePermissions(permissions: Permission[]): Permission[] {
  const seen = new Set<string>();
  return permissions.filter((p) => {
    const key = `${p.action}:${p.resource}:${p.own || false}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole,
  action: PermissionAction,
  resource: Resource,
  isOwnResource: boolean = false,
): boolean {
  const permissions = getRolePermissions(role);

  return permissions.some((p) => {
    // 'manage' action grants all actions
    if (p.action === 'manage' && p.resource === resource) {
      return true;
    }

    // Check exact match
    if (p.action === action && p.resource === resource) {
      // If permission is for own resources only, check ownership
      if (p.own && !isOwnResource) {
        return false;
      }
      return true;
    }

    return false;
  });
}

/**
 * Create a permission checker function for a specific user
 */
export function createPermissionChecker(role: UserRole, userId?: number) {
  return (action: PermissionAction, resource: Resource, resourceOwnerId?: number): boolean => {
    const isOwnResource = resourceOwnerId !== undefined && resourceOwnerId === userId;
    return hasPermission(role, action, resource, isOwnResource);
  };
}

/**
 * Get the dashboard redirect path for a role
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'leader':
      return '/dashboard/leader';
    case 'entrepreneur':
      return '/dashboard/entrepreneur';
    default:
      return '/feed';
  }
}

/**
 * Get default landing page after login
 */
export function getDefaultLandingPage(role: UserRole): string {
  return '/feed';
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  // Public routes
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/store',
    '/leaders',
    '/entrepreneurs',
    '/causes',
  ];
  if (publicRoutes.some((r) => path === r || path.startsWith(r + '/'))) {
    return true;
  }

  // Feed requires authentication
  if (path.startsWith('/feed')) {
    return true; // Any authenticated user
  }

  // Dashboard routes
  if (path.startsWith('/dashboard/admin')) {
    return role === 'admin';
  }
  if (path.startsWith('/dashboard/leader')) {
    return role === 'admin' || role === 'leader';
  }
  if (path.startsWith('/dashboard/entrepreneur')) {
    return role === 'admin' || role === 'entrepreneur';
  }
  if (path.startsWith('/dashboard')) {
    return true; // General dashboard access for any authenticated user
  }

  // API routes are handled separately by API middleware
  if (path.startsWith('/api')) {
    return true;
  }

  return true;
}

/**
 * Export role display names
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: 'Administrador',
  leader: 'Lider',
  entrepreneur: 'Emprendedor',
};

/**
 * Export role colors for UI
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'dracula-purple',
  leader: 'leader',
  entrepreneur: 'entrepreneur',
};
