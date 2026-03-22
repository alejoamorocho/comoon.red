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
  cover_url: string | null;
  organization_name: string | null;
  who_we_are: string | null;
  our_why: string | null;
  how_to_help: string | null;
  years_active: number | null;
  impact_scope: string | null;
  community: string | null;
  areas_of_influence: string | null;
  people_impacted: number | null;
  achievements: string | null;
  testimonials: string | null;
  media_gallery: string | null;
  awards: string | null;
  email: string | null;
  preferred_contact: string | null;
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
      cover_url: string | null;
      organization_name: string | null;
      who_we_are: string | null;
      our_why: string | null;
      how_to_help: string | null;
      years_active: number | null;
      impact_scope: string | null;
      community: string | null;
      areas_of_influence: unknown;
      people_impacted: number | null;
      achievements: unknown;
      testimonials: unknown;
      media_gallery: unknown;
      awards: unknown;
      email: string | null;
      preferred_contact: string | null;
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
    if (data.cover_url !== undefined) {
      fields.push('cover_url = ?');
      values.push(data.cover_url);
    }
    if (data.organization_name !== undefined) {
      fields.push('organization_name = ?');
      values.push(data.organization_name);
    }
    if (data.who_we_are !== undefined) {
      fields.push('who_we_are = ?');
      values.push(data.who_we_are);
    }
    if (data.our_why !== undefined) {
      fields.push('our_why = ?');
      values.push(data.our_why);
    }
    if (data.how_to_help !== undefined) {
      fields.push('how_to_help = ?');
      values.push(data.how_to_help);
    }
    if (data.years_active !== undefined) {
      fields.push('years_active = ?');
      values.push(data.years_active);
    }
    if (data.impact_scope !== undefined) {
      fields.push('impact_scope = ?');
      values.push(data.impact_scope);
    }
    if (data.community !== undefined) {
      fields.push('community = ?');
      values.push(data.community);
    }
    if (data.areas_of_influence !== undefined) {
      fields.push('areas_of_influence = ?');
      values.push(data.areas_of_influence ? JSON.stringify(data.areas_of_influence) : null);
    }
    if (data.people_impacted !== undefined) {
      fields.push('people_impacted = ?');
      values.push(data.people_impacted);
    }
    if (data.achievements !== undefined) {
      fields.push('achievements = ?');
      values.push(data.achievements ? JSON.stringify(data.achievements) : null);
    }
    if (data.testimonials !== undefined) {
      fields.push('testimonials = ?');
      values.push(data.testimonials ? JSON.stringify(data.testimonials) : null);
    }
    if (data.media_gallery !== undefined) {
      fields.push('media_gallery = ?');
      values.push(data.media_gallery ? JSON.stringify(data.media_gallery) : null);
    }
    if (data.awards !== undefined) {
      fields.push('awards = ?');
      values.push(data.awards ? JSON.stringify(data.awards) : null);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.preferred_contact !== undefined) {
      fields.push('preferred_contact = ?');
      values.push(data.preferred_contact);
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
