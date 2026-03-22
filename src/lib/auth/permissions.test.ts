import { describe, it, expect } from 'vitest';
import {
  getRolePermissions,
  hasPermission,
  createPermissionChecker,
  getDashboardPath,
  getDefaultLandingPage,
  canAccessRoute,
  ROLE_DISPLAY_NAMES,
  ROLE_COLORS,
} from './permissions';

describe('getRolePermissions', () => {
  it('returns base permissions for leader role', () => {
    const permissions = getRolePermissions('leader');
    expect(permissions.length).toBeGreaterThan(0);
    expect(permissions).toContainEqual({ action: 'create', resource: 'causes' });
    expect(permissions).toContainEqual({ action: 'read', resource: 'feed' });
  });

  it('returns base permissions for entrepreneur role', () => {
    const permissions = getRolePermissions('entrepreneur');
    expect(permissions.length).toBeGreaterThan(0);
    expect(permissions).toContainEqual({ action: 'create', resource: 'products' });
    expect(permissions).toContainEqual({ action: 'read', resource: 'feed' });
  });

  it('returns admin permissions including inherited ones from leader and entrepreneur', () => {
    const permissions = getRolePermissions('admin');
    // Admin has its own manage permissions
    expect(permissions).toContainEqual({ action: 'manage', resource: 'users' });
    expect(permissions).toContainEqual({ action: 'manage', resource: 'causes' });
    // Admin inherits leader permissions
    expect(permissions).toContainEqual({ action: 'create', resource: 'causes' });
    // Admin inherits entrepreneur permissions
    expect(permissions).toContainEqual({ action: 'create', resource: 'products' });
  });

  it('deduplicates inherited permissions', () => {
    const permissions = getRolePermissions('admin');
    // Both leader and entrepreneur have { action: 'read', resource: 'feed' }
    const feedReadPerms = permissions.filter((p) => p.action === 'read' && p.resource === 'feed');
    expect(feedReadPerms.length).toBe(1);
  });
});

describe('hasPermission', () => {
  // Leader permissions
  it('leader can read causes', () => {
    expect(hasPermission('leader', 'read', 'causes')).toBe(true);
  });

  it('leader can create causes', () => {
    expect(hasPermission('leader', 'create', 'causes')).toBe(true);
  });

  it('leader can update own causes', () => {
    expect(hasPermission('leader', 'update', 'causes', true)).toBe(true);
  });

  it('leader cannot update others causes', () => {
    expect(hasPermission('leader', 'update', 'causes', false)).toBe(false);
  });

  it('leader cannot create products', () => {
    expect(hasPermission('leader', 'create', 'products')).toBe(false);
  });

  it('leader cannot manage users', () => {
    expect(hasPermission('leader', 'manage', 'users')).toBe(false);
  });

  // Entrepreneur permissions
  it('entrepreneur can create products', () => {
    expect(hasPermission('entrepreneur', 'create', 'products')).toBe(true);
  });

  it('entrepreneur cannot create causes', () => {
    expect(hasPermission('entrepreneur', 'create', 'causes')).toBe(false);
  });

  it('entrepreneur can update own products', () => {
    expect(hasPermission('entrepreneur', 'update', 'products', true)).toBe(true);
  });

  it('entrepreneur cannot update others products', () => {
    expect(hasPermission('entrepreneur', 'update', 'products', false)).toBe(false);
  });

  // Admin permissions
  it('admin can manage all resources via manage action', () => {
    expect(hasPermission('admin', 'create', 'users')).toBe(true);
    expect(hasPermission('admin', 'read', 'users')).toBe(true);
    expect(hasPermission('admin', 'update', 'users')).toBe(true);
    expect(hasPermission('admin', 'delete', 'users')).toBe(true);
  });

  it('admin can manage causes (inherited + manage)', () => {
    expect(hasPermission('admin', 'create', 'causes')).toBe(true);
    expect(hasPermission('admin', 'update', 'causes', false)).toBe(true);
    expect(hasPermission('admin', 'delete', 'causes', false)).toBe(true);
  });

  it('admin can manage products (inherited + manage)', () => {
    expect(hasPermission('admin', 'create', 'products')).toBe(true);
    expect(hasPermission('admin', 'update', 'products', false)).toBe(true);
  });
});

describe('createPermissionChecker', () => {
  it('creates a checker that uses ownership correctly', () => {
    const checker = createPermissionChecker('leader', 42);
    // Own resource
    expect(checker('update', 'causes', 42)).toBe(true);
    // Not own resource
    expect(checker('update', 'causes', 99)).toBe(false);
  });

  it('admin checker allows all regardless of ownership', () => {
    const checker = createPermissionChecker('admin', 1);
    expect(checker('update', 'causes', 999)).toBe(true);
    expect(checker('delete', 'products', 999)).toBe(true);
  });

  it('checker without userId treats all resources as not own', () => {
    const checker = createPermissionChecker('leader');
    expect(checker('update', 'causes', 42)).toBe(false);
  });
});

describe('getDashboardPath', () => {
  it('returns correct path for admin', () => {
    expect(getDashboardPath('admin')).toBe('/dashboard/admin');
  });

  it('returns correct path for leader', () => {
    expect(getDashboardPath('leader')).toBe('/dashboard/leader');
  });

  it('returns correct path for entrepreneur', () => {
    expect(getDashboardPath('entrepreneur')).toBe('/dashboard/entrepreneur');
  });
});

describe('getDefaultLandingPage', () => {
  it('returns /feed for all roles', () => {
    expect(getDefaultLandingPage('admin')).toBe('/feed');
    expect(getDefaultLandingPage('leader')).toBe('/feed');
    expect(getDefaultLandingPage('entrepreneur')).toBe('/feed');
  });
});

describe('canAccessRoute', () => {
  it('allows public routes for any role', () => {
    expect(canAccessRoute('leader', '/')).toBe(true);
    expect(canAccessRoute('leader', '/login')).toBe(true);
    expect(canAccessRoute('leader', '/register')).toBe(true);
    expect(canAccessRoute('entrepreneur', '/store')).toBe(true);
    expect(canAccessRoute('entrepreneur', '/causes')).toBe(true);
  });

  it('allows feed for any authenticated role', () => {
    expect(canAccessRoute('leader', '/feed')).toBe(true);
    expect(canAccessRoute('entrepreneur', '/feed')).toBe(true);
    expect(canAccessRoute('admin', '/feed')).toBe(true);
  });

  it('restricts admin dashboard to admin only', () => {
    expect(canAccessRoute('admin', '/dashboard/admin')).toBe(true);
    expect(canAccessRoute('leader', '/dashboard/admin')).toBe(false);
    expect(canAccessRoute('entrepreneur', '/dashboard/admin')).toBe(false);
  });

  it('allows leader dashboard for admin and leader', () => {
    expect(canAccessRoute('admin', '/dashboard/leader')).toBe(true);
    expect(canAccessRoute('leader', '/dashboard/leader')).toBe(true);
    expect(canAccessRoute('entrepreneur', '/dashboard/leader')).toBe(false);
  });

  it('allows entrepreneur dashboard for admin and entrepreneur', () => {
    expect(canAccessRoute('admin', '/dashboard/entrepreneur')).toBe(true);
    expect(canAccessRoute('entrepreneur', '/dashboard/entrepreneur')).toBe(true);
    expect(canAccessRoute('leader', '/dashboard/entrepreneur')).toBe(false);
  });

  it('allows general dashboard for any role', () => {
    expect(canAccessRoute('leader', '/dashboard')).toBe(true);
    expect(canAccessRoute('entrepreneur', '/dashboard')).toBe(true);
    expect(canAccessRoute('admin', '/dashboard')).toBe(true);
  });

  it('allows API routes for any role', () => {
    expect(canAccessRoute('leader', '/api/causes')).toBe(true);
    expect(canAccessRoute('entrepreneur', '/api/products')).toBe(true);
  });
});

describe('ROLE_DISPLAY_NAMES', () => {
  it('has display names for all roles', () => {
    expect(ROLE_DISPLAY_NAMES.admin).toBe('Administrador');
    expect(ROLE_DISPLAY_NAMES.leader).toBe('Lider');
    expect(ROLE_DISPLAY_NAMES.entrepreneur).toBe('Emprendedor');
  });
});

describe('ROLE_COLORS', () => {
  it('has colors for all roles', () => {
    expect(ROLE_COLORS.admin).toBeDefined();
    expect(ROLE_COLORS.leader).toBeDefined();
    expect(ROLE_COLORS.entrepreneur).toBeDefined();
  });
});
