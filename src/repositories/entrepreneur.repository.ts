import type { D1Database } from '@cloudflare/workers-types';
import { BaseRepository } from './base.repository';

export interface EntrepreneurRow {
  id: number;
  user_id: number | null;
  store_name: string;
  bio: string | null;
  location: string | null;
  city: string | null;
  department: string | null;
  photo_url: string | null;
  contact_info: string | null;
  cover_url: string | null;
  logo_url: string | null;
  store_story: string | null;
  what_makes_special: string | null;
  social_connection: string | null;
  years_in_business: number | null;
  email: string | null;
  preferred_contact: string | null;
  store_policies: string | null;
  shipping_info: string | null;
  is_verified: boolean;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export class EntrepreneurRepository extends BaseRepository<EntrepreneurRow> {
  constructor(db: D1Database) {
    super(db, 'entrepreneurs');
  }

  async findByUserId(userId: number): Promise<EntrepreneurRow | null> {
    return this.db
      .prepare('SELECT * FROM entrepreneurs WHERE user_id = ?')
      .bind(userId)
      .first<EntrepreneurRow>();
  }

  async create(data: {
    store_name: string;
    bio?: string | null;
    location?: string | null;
    city?: string | null;
    department?: string | null;
    photo_url?: string | null;
    contact_info?: unknown;
  }): Promise<EntrepreneurRow> {
    const result = await this.db
      .prepare(
        `INSERT INTO entrepreneurs (store_name, bio, location, city, department, photo_url, contact_info)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        data.store_name,
        data.bio || null,
        data.location || null,
        data.city || null,
        data.department || null,
        data.photo_url || null,
        data.contact_info ? JSON.stringify(data.contact_info) : null,
      )
      .run();

    const id = result.meta.last_row_id as number;
    return (await this.findById(id))!;
  }

  async createMinimal(data: {
    store_name: string;
    bio?: string | null;
    location?: string | null;
  }): Promise<number> {
    const result = await this.db
      .prepare(`INSERT INTO entrepreneurs (store_name, bio, location) VALUES (?, ?, ?)`)
      .bind(data.store_name, data.bio || null, data.location || null)
      .run();
    return result.meta.last_row_id as number;
  }

  async update(
    id: number,
    data: Partial<{
      store_name: string;
      bio: string | null;
      location: string | null;
      city: string | null;
      department: string | null;
      photo_url: string | null;
      contact_info: unknown;
      cover_url: string | null;
      logo_url: string | null;
      store_story: string | null;
      what_makes_special: string | null;
      social_connection: string | null;
      years_in_business: number | null;
      email: string | null;
      preferred_contact: string | null;
      store_policies: string | null;
      shipping_info: string | null;
    }>,
  ): Promise<EntrepreneurRow | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.store_name !== undefined) {
      fields.push('store_name = ?');
      values.push(data.store_name);
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
    if (data.cover_url !== undefined) {
      fields.push('cover_url = ?');
      values.push(data.cover_url);
    }
    if (data.logo_url !== undefined) {
      fields.push('logo_url = ?');
      values.push(data.logo_url);
    }
    if (data.store_story !== undefined) {
      fields.push('store_story = ?');
      values.push(data.store_story);
    }
    if (data.what_makes_special !== undefined) {
      fields.push('what_makes_special = ?');
      values.push(data.what_makes_special);
    }
    if (data.social_connection !== undefined) {
      fields.push('social_connection = ?');
      values.push(data.social_connection);
    }
    if (data.years_in_business !== undefined) {
      fields.push('years_in_business = ?');
      values.push(data.years_in_business);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.preferred_contact !== undefined) {
      fields.push('preferred_contact = ?');
      values.push(data.preferred_contact);
    }
    if (data.store_policies !== undefined) {
      fields.push('store_policies = ?');
      values.push(data.store_policies);
    }
    if (data.shipping_info !== undefined) {
      fields.push('shipping_info = ?');
      values.push(data.shipping_info);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db
      .prepare(`UPDATE entrepreneurs SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }

  async setUserId(entrepreneurId: number, userId: number): Promise<void> {
    await this.db
      .prepare('UPDATE entrepreneurs SET user_id = ? WHERE id = ?')
      .bind(userId, entrepreneurId)
      .run();
  }

  async findAllFiltered(options: {
    limit: number;
    offset: number;
    department?: string;
  }): Promise<{ results: EntrepreneurRow[] }> {
    const params: (string | number)[] = [];
    let query = 'SELECT * FROM entrepreneurs WHERE 1=1';

    if (options.department) {
      query += ' AND department = ?';
      params.push(options.department);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(options.limit, options.offset);

    const { results } = await this.db
      .prepare(query)
      .bind(...params)
      .all<EntrepreneurRow>();
    return { results: results || [] };
  }

  async getDistinctDepartments(): Promise<string[]> {
    const { results } = await this.db
      .prepare(
        `SELECT DISTINCT department FROM entrepreneurs WHERE department IS NOT NULL ORDER BY department`,
      )
      .all<{ department: string }>();
    return (results || []).map((r) => r.department);
  }
}
