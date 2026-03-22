import type { D1Database } from '@cloudflare/workers-types';
import { BaseRepository } from './base.repository';

export interface ProductRow {
  id: number;
  entrepreneur_id: number | null;
  leader_id: number | null;
  cause_id: number;
  name: string;
  description: string | null;
  price: number;
  contribution_text: string | null;
  contribution_amount: number | null;
  contribution_type: string;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithDetails extends ProductRow {
  store_name: string | null;
  cause_title: string;
  leader_name: string;
  seller_name: string;
  seller_photo: string | null;
  seller_type: 'entrepreneur' | 'leader';
}

export class ProductRepository extends BaseRepository<ProductRow> {
  constructor(db: D1Database) {
    super(db, 'products');
  }

  async findAllWithDetails(options?: {
    causeId?: string;
    entrepreneurId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProductWithDetails[]> {
    const limit = options?.limit ?? 50;
    const params: (string | number)[] = [];

    let query = `
      SELECT p.*,
        e.store_name,
        c.title as cause_title,
        l.name as leader_name,
        CASE WHEN p.leader_id IS NOT NULL THEN pl.name ELSE e.store_name END as seller_name,
        CASE WHEN p.leader_id IS NOT NULL THEN pl.photo_url ELSE e.photo_url END as seller_photo,
        CASE WHEN p.leader_id IS NOT NULL THEN 'leader' ELSE 'entrepreneur' END as seller_type
      FROM products p
      LEFT JOIN entrepreneurs e ON p.entrepreneur_id = e.id
      LEFT JOIN leaders pl ON p.leader_id = pl.id
      JOIN causes c ON p.cause_id = c.id
      JOIN leaders l ON c.leader_id = l.id
    `;

    const conditions: string[] = [];

    if (options?.causeId) {
      conditions.push('p.cause_id = ?');
      params.push(options.causeId);
    }
    if (options?.entrepreneurId) {
      conditions.push('p.entrepreneur_id = ?');
      params.push(options.entrepreneurId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT ?`;
    params.push(limit);

    const { results } = await this.db
      .prepare(query)
      .bind(...params)
      .all<ProductWithDetails>();
    return results || [];
  }

  async create(data: {
    entrepreneur_id?: number | null;
    leader_id?: number | null;
    cause_id: number;
    name: string;
    description?: string | null;
    price: number;
    contribution_text?: string | null;
    contribution_amount?: number | null;
    contribution_type?: string;
    photo_url?: string | null;
  }): Promise<ProductRow> {
    const result = await this.db
      .prepare(
        `INSERT INTO products (entrepreneur_id, leader_id, cause_id, name, description, price,
         contribution_text, contribution_amount, contribution_type, photo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        data.entrepreneur_id || null,
        data.leader_id || null,
        data.cause_id,
        data.name,
        data.description || null,
        data.price,
        data.contribution_text || null,
        data.contribution_amount || null,
        data.contribution_type || 'percentage',
        data.photo_url || null,
      )
      .run();

    const id = result.meta.last_row_id as number;
    return (await this.findById(id))!;
  }

  async findByLeaderId(leaderId: number, limit = 50): Promise<ProductWithDetails[]> {
    const query = `
      SELECT p.*,
        e.store_name,
        c.title as cause_title,
        l.name as leader_name,
        CASE WHEN p.leader_id IS NOT NULL THEN pl.name ELSE e.store_name END as seller_name,
        CASE WHEN p.leader_id IS NOT NULL THEN pl.photo_url ELSE e.photo_url END as seller_photo,
        CASE WHEN p.leader_id IS NOT NULL THEN 'leader' ELSE 'entrepreneur' END as seller_type
      FROM products p
      LEFT JOIN entrepreneurs e ON p.entrepreneur_id = e.id
      LEFT JOIN leaders pl ON p.leader_id = pl.id
      JOIN causes c ON p.cause_id = c.id
      JOIN leaders l ON c.leader_id = l.id
      WHERE (p.leader_id = ? OR c.leader_id = ?) AND p.is_active = 1
      ORDER BY p.created_at DESC LIMIT ?
    `;
    const { results } = await this.db
      .prepare(query)
      .bind(leaderId, leaderId, limit)
      .all<ProductWithDetails>();
    return results || [];
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      description: string | null;
      price: number;
      contribution_text: string | null;
      contribution_amount: number | null;
      contribution_type: string;
      photo_url: string | null;
      is_active: boolean;
    }>,
  ): Promise<ProductRow | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.price !== undefined) {
      fields.push('price = ?');
      values.push(data.price);
    }
    if (data.contribution_text !== undefined) {
      fields.push('contribution_text = ?');
      values.push(data.contribution_text);
    }
    if (data.contribution_amount !== undefined) {
      fields.push('contribution_amount = ?');
      values.push(data.contribution_amount);
    }
    if (data.contribution_type !== undefined) {
      fields.push('contribution_type = ?');
      values.push(data.contribution_type);
    }
    if (data.photo_url !== undefined) {
      fields.push('photo_url = ?');
      values.push(data.photo_url);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db
      .prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }
}
