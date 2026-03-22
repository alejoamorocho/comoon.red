/**
 * Authentication API Endpoints
 *
 * POST /api/auth/register - Register new user
 * POST /api/auth/login - Login
 * POST /api/auth/logout - Logout
 * GET  /api/auth/me - Get current user
 * POST /api/auth/refresh - Refresh token
 */

import { Hono } from 'hono';
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  createAuthCookie,
  createLogoutCookie,
  getDashboardPath,
  getDefaultLandingPage,
  authMiddleware,
  requireAuth,
} from '../lib/auth';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserSession,
  UserRole,
  DBUser,
  DBUserWithProfile,
} from '../lib/auth/types';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const auth = new Hono<{ Bindings: Bindings }>();

// Apply auth middleware to all routes
auth.use('/*', authMiddleware);

// Rate limiting is handled by Cloudflare WAF Rate Limiting Rules
// See: src/lib/auth/middleware.ts for configuration recommendations

/**
 * POST /api/auth/register
 */
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json<RegisterRequest>();
    const { email, password, confirmPassword, role, name, storeName, location, bio } = body;

    // Validation
    if (!email || !password || !confirmPassword || !role || !name) {
      return c.json<RegisterResponse>(
        {
          success: false,
          error: 'Todos los campos son requeridos',
        },
        400,
      );
    }

    if (password !== confirmPassword) {
      return c.json<RegisterResponse>(
        {
          success: false,
          error: 'Las contrasenas no coinciden',
        },
        400,
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return c.json<RegisterResponse>(
        {
          success: false,
          error: passwordValidation.errors.join('. '),
        },
        400,
      );
    }

    // Validate role
    const validRoles: UserRole[] = ['leader', 'entrepreneur'];
    if (!validRoles.includes(role)) {
      return c.json<RegisterResponse>(
        {
          success: false,
          error: 'Rol invalido',
        },
        400,
      );
    }

    // Check if email already exists
    const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first();

    if (existingUser) {
      return c.json<RegisterResponse>(
        {
          success: false,
          error: 'Este correo ya esta registrado',
        },
        400,
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Validate storeName for entrepreneurs before any DB writes
    if (role === 'entrepreneur' && !storeName) {
      return c.json<RegisterResponse>(
        {
          success: false,
          error: 'El nombre de la tienda es requerido para emprendedores',
        },
        400,
      );
    }

    // Create profile first to get the auto-generated ID
    let profileId: number;

    if (role === 'leader') {
      const result = await c.env.DB.prepare(
        `INSERT INTO leaders (name, bio, location) VALUES (?, ?, ?)`,
      )
        .bind(name, bio || null, location || null)
        .run();
      profileId = result.meta.last_row_id as number;
    } else {
      const result = await c.env.DB.prepare(
        `INSERT INTO entrepreneurs (store_name, bio, location) VALUES (?, ?, ?)`,
      )
        .bind(storeName, bio || null, location || null)
        .run();
      profileId = result.meta.last_row_id as number;
    }

    // Batch user creation + profile linkage for atomicity.
    // If this fails, clean up the orphaned profile.
    try {
      const userInsert = c.env.DB.prepare(
        `INSERT INTO users (email, password_hash, role, profile_id, is_active, is_verified)
                 VALUES (?, ?, ?, ?, 1, 0)`,
      ).bind(email.toLowerCase(), passwordHash, role, profileId);

      const batchResults = await c.env.DB.batch([userInsert]);
      const userId = batchResults[0].meta.last_row_id as number;

      // Now link the profile back to the user
      const profileTable = role === 'leader' ? 'leaders' : 'entrepreneurs';
      await c.env.DB.prepare(`UPDATE ${profileTable} SET user_id = ? WHERE id = ?`)
        .bind(userId, profileId)
        .run();

      return c.json<RegisterResponse>(
        {
          success: true,
          message: 'Usuario registrado exitosamente',
          userId,
        },
        201,
      );
    } catch (userError) {
      // Clean up orphaned profile on failure
      const profileTable = role === 'leader' ? 'leaders' : 'entrepreneurs';
      await c.env.DB.prepare(`DELETE FROM ${profileTable} WHERE id = ?`)
        .bind(profileId)
        .run()
        .catch(() => {});

      throw userError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return c.json<RegisterResponse>(
      {
        success: false,
        error: 'Error al registrar usuario',
      },
      500,
    );
  }
});

/**
 * POST /api/auth/login
 */
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return c.json<LoginResponse>(
        {
          success: false,
          error: 'Email y contrasena son requeridos',
        },
        400,
      );
    }

    // Check if DB is available
    if (!c.env.DB) {
      console.error('Database not configured. Run: npx wrangler d1 create comoon-db');
      return c.json<LoginResponse>(
        {
          success: false,
          error: 'Base de datos no configurada. Contacta al administrador.',
        },
        500,
      );
    }

    // Find user with profile info
    const user = await c.env.DB.prepare(
      `
            SELECT
                u.*,
                COALESCE(l.name, e.store_name) as name,
                COALESCE(l.photo_url, e.photo_url) as photo_url
            FROM users u
            LEFT JOIN leaders l ON u.role = 'leader' AND u.profile_id = l.id
            LEFT JOIN entrepreneurs e ON u.role = 'entrepreneur' AND u.profile_id = e.id
            WHERE u.email = ?
        `,
    )
      .bind(email.toLowerCase())
      .first<DBUserWithProfile>();

    if (!user) {
      return c.json<LoginResponse>(
        {
          success: false,
          error: 'Credenciales invalidas',
        },
        401,
      );
    }

    if (!user.is_active) {
      return c.json<LoginResponse>(
        {
          success: false,
          error: 'Esta cuenta ha sido desactivada',
        },
        401,
      );
    }

    // Verify password
    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return c.json<LoginResponse>(
        {
          success: false,
          error: 'Credenciales invalidas',
        },
        401,
      );
    }

    // Check onboarding status
    const onboardingCompleted = Boolean((user as any).onboarding_completed);

    // Create session
    const session: UserSession = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      profileId: user.profile_id || undefined,
      name: user.name || undefined,
      onboardingComplete: onboardingCompleted,
      isVerified: Boolean(user.is_verified),
      isActive: Boolean(user.is_active),
    };

    // Generate tokens (fallback needed for astro dev mode)
    const jwtSecret: string = c.env.JWT_SECRET || 'comoon-dev-secret-change-in-production';
    const token = await generateAccessToken(session, jwtSecret, rememberMe);
    const refreshToken = await generateRefreshToken(user.id, jwtSecret);

    // Set auth cookie
    c.header('Set-Cookie', createAuthCookie(token, rememberMe));

    // Determine redirect based on onboarding status
    const redirectTo = onboardingCompleted ? getDefaultLandingPage(session.role) : '/onboarding';

    return c.json<LoginResponse>({
      success: true,
      token,
      refreshToken,
      user: session,
      redirectTo,
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Provide more specific error messages for common issues
    if (errorMessage.includes('no such table')) {
      return c.json<LoginResponse>(
        {
          success: false,
          error: 'Base de datos no inicializada. Ejecuta el schema SQL.',
        },
        500,
      );
    }

    return c.json<LoginResponse>(
      {
        success: false,
        error: 'Error al iniciar sesion. Revisa la consola del servidor.',
      },
      500,
    );
  }
});

/**
 * POST /api/auth/logout
 */
auth.post('/logout', async (c) => {
  // Clear auth cookie
  c.header('Set-Cookie', createLogoutCookie());

  return c.json({ success: true, message: 'Sesion cerrada' });
});

/**
 * GET /api/auth/me
 */
auth.get('/me', requireAuth, async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  // Fetch fresh user data from DB
  const dbUser = await c.env.DB.prepare(
    `
        SELECT
            u.id, u.email, u.role, u.profile_id, u.is_verified, u.is_active,
            u.onboarding_completed,
            COALESCE(l.name, e.store_name) as name,
            COALESCE(l.photo_url, e.photo_url) as photo_url,
            COALESCE(l.bio, e.bio) as bio,
            COALESCE(l.location, e.location) as location
        FROM users u
        LEFT JOIN leaders l ON u.role = 'leader' AND u.profile_id = l.id
        LEFT JOIN entrepreneurs e ON u.role = 'entrepreneur' AND u.profile_id = e.id
        WHERE u.id = ?
    `,
  )
    .bind(user.id)
    .first();

  if (!dbUser) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    profileId: dbUser.profile_id,
    name: dbUser.name,
    photoUrl: dbUser.photo_url,
    bio: dbUser.bio,
    location: dbUser.location,
    isVerified: Boolean(dbUser.is_verified),
    isActive: Boolean(dbUser.is_active),
    onboardingComplete: Boolean((dbUser as any).onboarding_completed),
    dashboardPath: getDashboardPath(dbUser.role as UserRole),
  });
});

/**
 * POST /api/auth/refresh
 */
auth.post('/refresh', async (c) => {
  try {
    const body = await c.req.json<{ refreshToken: string }>();
    const { refreshToken } = body;

    if (!refreshToken) {
      return c.json({ success: false, error: 'Refresh token required' }, 400);
    }

    const jwtSecret: string = c.env.JWT_SECRET || 'comoon-dev-secret-change-in-production';
    const payload = await verifyRefreshToken(refreshToken, jwtSecret);

    if (!payload) {
      return c.json({ success: false, error: 'Invalid refresh token' }, 401);
    }

    // Fetch user
    const user = await c.env.DB.prepare(
      `
            SELECT
                u.*,
                COALESCE(l.name, e.store_name) as name
            FROM users u
            LEFT JOIN leaders l ON u.role = 'leader' AND u.profile_id = l.id
            LEFT JOIN entrepreneurs e ON u.role = 'entrepreneur' AND u.profile_id = e.id
            WHERE u.id = ?
        `,
    )
      .bind(payload.userId)
      .first<DBUserWithProfile>();

    if (!user || !user.is_active) {
      return c.json({ success: false, error: 'User not found or inactive' }, 401);
    }

    // Create new session
    const session: UserSession = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      profileId: user.profile_id || undefined,
      name: user.name || undefined,
      onboardingComplete: Boolean((user as any).onboarding_completed),
      isVerified: Boolean(user.is_verified),
      isActive: Boolean(user.is_active),
    };

    // Generate new access token
    const token = await generateAccessToken(session, jwtSecret);

    // Set new auth cookie
    c.header('Set-Cookie', createAuthCookie(token));

    return c.json({
      success: true,
      token,
      user: session,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json({ success: false, error: 'Error refreshing token' }, 500);
  }
});

/**
 * POST /api/auth/change-password
 */
auth.post('/change-password', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json<{
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }>();

    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return c.json({ success: false, error: 'Todos los campos son requeridos' }, 400);
    }

    if (newPassword !== confirmPassword) {
      return c.json({ success: false, error: 'Las contrasenas no coinciden' }, 400);
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return c.json({ success: false, error: validation.errors.join('. ') }, 400);
    }

    // Verify current password
    const dbUser = await c.env.DB.prepare('SELECT password_hash FROM users WHERE id = ?')
      .bind(user!.id)
      .first<{ password_hash: string }>();

    if (!dbUser) {
      return c.json({ success: false, error: 'Usuario no encontrado' }, 404);
    }

    const validCurrent = await verifyPassword(currentPassword, dbUser.password_hash);
    if (!validCurrent) {
      return c.json({ success: false, error: 'Contrasena actual incorrecta' }, 401);
    }

    // Hash new password and update
    const newHash = await hashPassword(newPassword);
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    )
      .bind(newHash, user!.id)
      .run();

    return c.json({ success: true, message: 'Contrasena actualizada exitosamente' });
  } catch (error) {
    console.error('Change password error:', error);
    return c.json({ success: false, error: 'Error al cambiar contrasena' }, 500);
  }
});

/**
 * POST /api/auth/complete-onboarding
 * Marks the user as onboarded and returns a new token with onboardingComplete: true
 */
auth.post('/complete-onboarding', requireAuth, async (c) => {
  try {
    const user = c.get('user');

    // Mark onboarding as completed in DB
    await c.env.DB.prepare(
      'UPDATE users SET onboarding_completed = 1, onboarded_at = CURRENT_TIMESTAMP WHERE id = ?',
    )
      .bind(user!.id)
      .run();

    // Fetch updated user data
    const dbUser = await c.env.DB.prepare(
      `
            SELECT
                u.*,
                COALESCE(l.name, e.store_name) as name
            FROM users u
            LEFT JOIN leaders l ON u.role = 'leader' AND u.profile_id = l.id
            LEFT JOIN entrepreneurs e ON u.role = 'entrepreneur' AND u.profile_id = e.id
            WHERE u.id = ?
        `,
    )
      .bind(user!.id)
      .first<DBUserWithProfile>();

    if (!dbUser) {
      return c.json({ success: false, error: 'Usuario no encontrado' }, 404);
    }

    // Create new session with onboardingComplete
    const session: UserSession = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as UserRole,
      profileId: dbUser.profile_id || undefined,
      name: dbUser.name || undefined,
      onboardingComplete: true,
      isVerified: Boolean(dbUser.is_verified),
      isActive: Boolean(dbUser.is_active),
    };

    // Generate new token with onboardingComplete: true
    const jwtSecret: string = c.env.JWT_SECRET || 'comoon-dev-secret-change-in-production';
    const token = await generateAccessToken(session, jwtSecret);

    // Set new auth cookie
    c.header('Set-Cookie', createAuthCookie(token));

    return c.json({
      success: true,
      token,
      user: session,
      redirectTo: getDashboardPath(session.role),
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return c.json({ success: false, error: 'Error al completar onboarding' }, 500);
  }
});

export default auth;
