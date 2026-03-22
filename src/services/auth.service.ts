import { UserRepository } from '../repositories/user.repository';
import { LeaderRepository } from '../repositories/leader.repository';
import { EntrepreneurRepository } from '../repositories/entrepreneur.repository';
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getDashboardPath,
  getDefaultLandingPage,
} from '../lib/auth';
import type { UserSession, UserRole } from '../lib/auth/types';
import { ValidationError, ConflictError, UnauthorizedError, NotFoundError } from '../lib/errors';

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  name: string;
  storeName?: string;
  location?: string;
  bio?: string;
}

export interface RegisterResult {
  userId: number;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  user: UserSession;
  redirectTo: string;
}

export interface MeResult {
  id: number;
  email: string;
  role: string;
  profileId: number | null;
  name: string | null;
  photoUrl: string | null;
  bio: string | null;
  location: string | null;
  isVerified: boolean;
  isActive: boolean;
  dashboardPath: string;
}

export interface RefreshResult {
  token: string;
  user: UserSession;
}

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private leaderRepo: LeaderRepository,
    private entrepreneurRepo: EntrepreneurRepository,
    private jwtSecret: string,
  ) {}

  async register(data: RegisterData): Promise<RegisterResult> {
    if (!data.email || !data.password || !data.confirmPassword || !data.role || !data.name) {
      throw new ValidationError('Todos los campos son requeridos');
    }

    if (data.password !== data.confirmPassword) {
      throw new ValidationError('Las contrasenas no coinciden');
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.errors.join('. '));
    }

    const validRoles: UserRole[] = ['leader', 'entrepreneur'];
    if (!validRoles.includes(data.role)) {
      throw new ValidationError('Rol invalido');
    }

    const exists = await this.userRepo.existsByEmail(data.email);
    if (exists) {
      throw new ConflictError('Este correo ya esta registrado');
    }

    const passwordHash = await hashPassword(data.password);

    let profileId: number | null = null;

    if (data.role === 'leader') {
      profileId = await this.leaderRepo.createMinimal({
        name: data.name,
        bio: data.bio,
        location: data.location,
      });
    } else if (data.role === 'entrepreneur') {
      if (!data.storeName) {
        throw new ValidationError('El nombre de la tienda es requerido para emprendedores');
      }
      profileId = await this.entrepreneurRepo.createMinimal({
        store_name: data.storeName,
        bio: data.bio,
        location: data.location,
      });
    }

    const user = await this.userRepo.create({
      email: data.email,
      passwordHash,
      role: data.role,
      profileId,
    });

    if (data.role === 'leader' && profileId) {
      await this.leaderRepo.setUserId(profileId, user.id);
    } else if (data.role === 'entrepreneur' && profileId) {
      await this.entrepreneurRepo.setUserId(profileId, user.id);
    }

    return { userId: user.id };
  }

  async login(data: LoginData): Promise<LoginResult> {
    if (!data.email || !data.password) {
      throw new ValidationError('Email y contrasena son requeridos');
    }

    const user = await this.userRepo.findByEmailWithProfile(data.email);

    if (!user) {
      throw new UnauthorizedError('Credenciales invalidas');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Esta cuenta ha sido desactivada');
    }

    const validPassword = await verifyPassword(data.password, user.password_hash);
    if (!validPassword) {
      throw new UnauthorizedError('Credenciales invalidas');
    }

    const session: UserSession = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      profileId: user.profile_id || undefined,
      name: user.name || undefined,
      isVerified: Boolean(user.is_verified),
      isActive: Boolean(user.is_active),
    };

    const jwtSecret = this.jwtSecret || 'comoon-dev-secret-change-in-production';
    const token = await generateAccessToken(session, jwtSecret, data.rememberMe);
    const refreshToken = await generateRefreshToken(user.id, jwtSecret);
    const redirectTo = getDefaultLandingPage(session.role);

    return { token, refreshToken, user: session, redirectTo };
  }

  async getMe(userId: number): Promise<MeResult> {
    const dbUser = await this.userRepo.findByIdWithFullProfile(userId);

    if (!dbUser) {
      throw new NotFoundError('User');
    }

    return {
      id: dbUser.id as number,
      email: dbUser.email as string,
      role: dbUser.role as string,
      profileId: (dbUser.profile_id as number) || null,
      name: (dbUser.name as string) || null,
      photoUrl: (dbUser.photo_url as string) || null,
      bio: (dbUser.bio as string) || null,
      location: (dbUser.location as string) || null,
      isVerified: Boolean(dbUser.is_verified),
      isActive: Boolean(dbUser.is_active),
      dashboardPath: getDashboardPath(dbUser.role as UserRole),
    };
  }

  async refreshToken(refreshTokenStr: string): Promise<RefreshResult> {
    if (!refreshTokenStr) {
      throw new ValidationError('Refresh token required');
    }

    const jwtSecret = this.jwtSecret || 'comoon-dev-secret-change-in-production';
    const payload = await verifyRefreshToken(refreshTokenStr, jwtSecret);

    if (!payload) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const user = await this.userRepo.findByIdWithProfile(payload.userId);

    if (!user || !user.is_active) {
      throw new UnauthorizedError('User not found or inactive');
    }

    const session: UserSession = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      profileId: user.profile_id || undefined,
      name: user.name || undefined,
      isVerified: Boolean(user.is_verified),
      isActive: Boolean(user.is_active),
    };

    const token = await generateAccessToken(session, jwtSecret);

    return { token, user: session };
  }

  async changePassword(
    userId: number,
    data: { currentPassword: string; newPassword: string; confirmPassword: string },
  ): Promise<void> {
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      throw new ValidationError('Todos los campos son requeridos');
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new ValidationError('Las contrasenas no coinciden');
    }

    const validation = validatePassword(data.newPassword);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join('. '));
    }

    const currentHash = await this.userRepo.getPasswordHash(userId);
    if (!currentHash) {
      throw new NotFoundError('Usuario');
    }

    const validCurrent = await verifyPassword(data.currentPassword, currentHash);
    if (!validCurrent) {
      throw new UnauthorizedError('Contrasena actual incorrecta');
    }

    const newHash = await hashPassword(data.newPassword);
    await this.userRepo.update(userId, { passwordHash: newHash });
  }
}
