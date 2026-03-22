import type { D1Database } from '@cloudflare/workers-types';
import { BaseRepository } from './base.repository';
import { safeJsonParse } from '../lib/utils';

export interface LeaderRow {
  id: number;
  user_id: number | null;
  name: string;
  bio: string | null;
  location: string | null;
  city: string | null;
  department: string | null;
  photo_url: string | null;
  contact_info: string | null;
  social_links: string | null;
  tags: string | null;
  is_verified: boolean;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderWithCause extends LeaderRow {
  active_cause_title: string | null;
}

export interface LeaderWithCauses extends LeaderRow {
  causes: CauseRow[];
}

export interface CauseRow {
  id: number;
  leader_id: number;
  title: string;
  description: string | null;
  target_goal: number | null;
  current_amount: number;
  photo_url: string | null;
  evidence_photos: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export class LeaderRepository extends BaseRepository<LeaderRow> {
  constructor(db: D1Database) {
    super(db, 'leaders');
  }

  async findAllWithActiveCause(options?: {
    limit?: number;
    offset?: number;
    department?: string;
    tag?: string;
  }): Promise<LeaderWithCause[]> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const params: (string | number)[] = [];

    let query = `
      SELECT l.*, c.title as active_cause_title
      FROM leaders l
      LEFT JOIN causes c ON l.id = c.leader_id AND c.status = 'active'
      WHERE 1=1
    `;

    if (options?.department) {
      query += ` AND l.department = ?`;
      params.push(options.department);
    }

    if (options?.tag) {
      query += ` AND l.tags LIKE ?`;
      params.push(`%"${options.tag}"%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results } = await this.db
      .prepare(query)
      .bind(...params)
      .all<LeaderWithCause>();
    return results || [];
  }

  async findByIdWithCauses(id: number): Promise<LeaderWithCauses | null> {
    const leader = await this.db
      .prepare('SELECT * FROM leaders WHERE id = ?')
      .bind(id)
      .first<LeaderRow>();

    if (!leader) return null;

    const { results: causes } = await this.db
      .prepare('SELECT * FROM causes WHERE leader_id = ?')
      .bind(id)
      .all<CauseRow>();

    return { ...leader, causes: causes || [] };
  }

  async findByUserId(userId: number): Promise<LeaderRow | null> {
    return this.db
      .prepare('SELECT * FROM leaders WHERE user_id = ?')
      .bind(userId)
      .first<LeaderRow>();
  }

  async findLeaderIdByUserId(userId: number): Promise<number | null> {
    const result = await this.db
      .prepare(
        `SELECT l.id FROM leaders l
         JOIN users u ON l.user_id = u.id
         WHERE u.id = ?`,
      )
      .bind(userId)
      .first<{ id: number }>();
    return result?.id ?? null;
  }

  async create(data: {
    name: string;
    bio?: string | null;
    location?: string | null;
    city?: string | null;
    department?: string | null;
    photo_url?: string | null;
    contact_info?: unknown;
    social_links?: unknown;
    tags?: unknown;
  }): Promise<LeaderRow> {
    const result = await this.db
      .prepare(
        `INSERT INTO leaders (name, bio, location, city, department, photo_url, contact_info, social_links, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        data.name,
        data.bio || null,
        data.location || null,
        data.city || null,
        data.department || null,
        data.photo_url || null,
        data.contact_info ? JSON.stringify(data.contact_info) : null,
        data.social_links ? JSON.stringify(data.social_links) : null,
        data.tags ? JSON.stringify(data.tags) : null,
      )
      .run();

    const id = result.meta.last_row_id as number;
    return (await this.findById(id))!;
  }

  async createMinimal(data: {
    name: string;
    bio?: string | null;
    location?: string | null;
  }): Promise<number> {
    const result = await this.db
      .prepare(`INSERT INTO leaders (name, bio, location) VALUES (?, ?, ?)`)
      .bind(data.name, data.bio || null, data.location || null)
      .run();
    return result.meta.last_row_id as number;
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      bio: string | null;
      location: string | null;
      city: string | null;
      department: string | null;
      photo_url: string | null;
      contact_info: unknown;
      social_links: unknown;
      tags: unknown;
    }>,
  ): Promise<LeaderRow | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.bio !== undefined) {
      fields.push('bio = ?');
      values.push(data.bio);
    }
    if (data.location !== undefined) {
      fields.push('location = ?');
      values.push(data.location);
    }
    if (data.city !== undefined) {
      fields.push('city = ?');
      values.push(data.city);
    }
    if (data.department !== undefined) {
      fields.push('department = ?');
      values.push(data.department);
    }
    if (data.photo_url !== undefined) {
      fields.push('photo_url = ?');
      values.push(data.photo_url);
    }
    if (data.contact_info !== undefined) {
      fields.push('contact_info = ?');
      values.push(data.contact_info ? JSON.stringify(data.contact_info) : null);
    }
    if (data.social_links !== undefined) {
      fields.push('social_links = ?');
      values.push(data.social_links ? JSON.stringify(data.social_links) : null);
    }
    if (data.tags !== undefined) {
      fields.push('tags = ?');
      values.push(data.tags ? JSON.stringify(data.tags) : null);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db
      .prepare(`UPDATE leaders SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }

  async setUserId(leaderId: number, userId: number): Promise<void> {
    await this.db
      .prepare('UPDATE leaders SET user_id = ? WHERE id = ?')
      .bind(userId, leaderId)
      .run();
  }
}
