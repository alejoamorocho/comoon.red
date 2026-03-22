import type { D1Database } from '@cloudflare/workers-types';
import { BaseRepository } from './base.repository';
import type { DBUser, DBUserWithProfile, UserRole } from '../lib/auth/types';

export class UserRepository extends BaseRepository<DBUser> {
  constructor(db: D1Database) {
    super(db, 'users');
  }

  async findByEmail(email: string): Promise<DBUser | null> {
    return this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first<DBUser>();
  }

  async findByEmailWithProfile(email: string): Promise<DBUserWithProfile | null> {
    return this.db
      .prepare(
        `SELECT
          u.*,
          COALESCE(l.name, e.store_name) as name,
          COALESCE(l.photo_url, e.photo_url) as photo_url
        FROM users u
        LEFT JOIN leaders l ON u.role = 'leader' AND u.profile_id = l.id
        LEFT JOIN entrepreneurs e ON u.role = 'entrepreneur' AND u.profile_id = e.id
        WHERE u.email = ?`,
      )
      .bind(email.toLowerCase())
      .first<DBUserWithProfile>();
  }

  async findByIdWithProfile(id: number): Promise<DBUserWithProfile | null> {
    return this.db
      .prepare(
        `SELECT
          u.*,
          COALESCE(l.name, e.store_name) as name,
          COALESCE(l.photo_url, e.photo_url) as photo_url
        FROM users u
        LEFT JOIN leaders l ON u.role = 'leader' AND u.profile_id = l.id
        LEFT JOIN entrepreneurs e ON u.role = 'entrepreneur' AND u.profile_id = e.id
        WHERE u.id = ?`,
      )
      .bind(id)
      .first<DBUserWithProfile>();
  }

  async findByIdWithFullProfile(id: number): Promise<
    | (DBUserWithProfile & {
        bio?: string;
        location?: string;
      })
    | null
  > {
    return this.db
      .prepare(
        `SELECT
          u.id, u.email, u.role, u.profile_id, u.is_verified, u.is_active,
          COALESCE(l.name, e.store_name) as name,
          COALESCE(l.photo_url, e.photo_url) as photo_url,
          COALESCE(l.bio, e.bio) as bio,
          COALESCE(l.location, e.location) as location
        FROM users u
        LEFT JOIN leaders l ON u.role = 'leader' AND u.profile_id = l.id
        LEFT JOIN entrepreneurs e ON u.role = 'entrepreneur' AND u.profile_id = e.id
        WHERE u.id = ?`,
      )
      .bind(id)
      .first();
  }

  async create(data: {
    email: string;
    passwordHash: string;
    role: UserRole;
    profileId: number | null;
  }): Promise<DBUser> {
    const result = await this.db
      .prepare(
        `INSERT INTO users (email, password_hash, role, profile_id, is_active, is_verified)
         VALUES (?, ?, ?, ?, 1, 0)`,
      )
      .bind(data.email.toLowerCase(), data.passwordHash, data.role, data.profileId)
      .run();

    const id = result.meta.last_row_id as number;
    return (await this.findById(id))!;
  }

  async update(id: number, data: Partial<{ passwordHash: string }>): Promise<DBUser | null> {
    if (data.passwordHash) {
      await this.db
        .prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(data.passwordHash, id)
        .run();
    }
    return this.findById(id);
  }

  async getPasswordHash(id: number): Promise<string | null> {
    const result = await this.db
      .prepare('SELECT password_hash FROM users WHERE id = ?')
      .bind(id)
      .first<{ password_hash: string }>();
    return result?.password_hash ?? null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first();
    return result !== null;
  }
}
