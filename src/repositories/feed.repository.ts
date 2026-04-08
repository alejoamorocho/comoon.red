import type { D1Database } from '@cloudflare/workers-types';
import { escapeLikePattern } from '../lib/utils';

export interface FeedQueryOptions {
  cursor?: { timestamp: string; id: number } | null;
  limit: number;
  types: string[];
  department?: string;
  city?: string;
  categories?: string[];
}

export interface FeedProductRow {
  id: number;
  type: string;
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  contribution_text: string | null;
  contribution_amount: number | null;
  contribution_type: string;
  entrepreneur_id: number | null;
  store_name: string | null;
  entrepreneur_photo: string | null;
  entrepreneur_city: string | null;
  entrepreneur_department: string | null;
  product_leader_id: number | null;
  product_leader_name: string | null;
  product_leader_photo: string | null;
  seller_name: string;
  seller_photo: string | null;
  seller_city: string | null;
  seller_department: string | null;
  seller_type: string;
  cause_id: number;
  cause_title: string;
  leader_id: number;
  leader_name: string;
}

export interface FeedCauseRow {
  id: number;
  type: string;
  created_at: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  target_goal: number | null;
  current_amount: number;
  status: string;
  leader_id: number;
  leader_name: string;
  leader_photo: string | null;
  leader_city: string | null;
  leader_department: string | null;
  leader_tags: string | null;
}

export interface FeedCauseUpdateRow {
  id: number;
  type: string;
  created_at: string;
  title: string;
  content: string;
  photo_url: string | null;
  photos: string | null;
  update_type: string;
  is_closing: number | boolean;
  leader_id: number;
  leader_name: string;
  leader_photo: string | null;
  leader_city: string | null;
  leader_department: string | null;
  cause_id: number;
  cause_title: string;
  cause_status: string;
}

export class FeedRepository {
  constructor(private db: D1Database) {}

  async fetchProducts(options: FeedQueryOptions): Promise<FeedProductRow[]> {
    const cursorCondition = options.cursor
      ? `AND (p.created_at < ? OR (p.created_at = ? AND p.id < ?))`
      : '';
    const cursorParams = options.cursor
      ? [options.cursor.timestamp, options.cursor.timestamp, options.cursor.id]
      : [];

    let query = `
      SELECT
        p.id, 'product' as type, p.created_at,
        p.name, p.description, p.price, p.photo_url,
        p.contribution_text, p.contribution_amount, p.contribution_type,
        e.id as entrepreneur_id, e.store_name, e.photo_url as entrepreneur_photo,
        e.city as entrepreneur_city, e.department as entrepreneur_department,
        pl.id as product_leader_id, pl.name as product_leader_name, pl.photo_url as product_leader_photo,
        CASE WHEN p.leader_id IS NOT NULL THEN pl.name ELSE e.store_name END as seller_name,
        CASE WHEN p.leader_id IS NOT NULL THEN pl.photo_url ELSE e.photo_url END as seller_photo,
        CASE WHEN p.leader_id IS NOT NULL THEN pl.city ELSE e.city END as seller_city,
        CASE WHEN p.leader_id IS NOT NULL THEN pl.department ELSE e.department END as seller_department,
        CASE WHEN p.leader_id IS NOT NULL THEN 'leader' ELSE 'entrepreneur' END as seller_type,
        c.id as cause_id, c.title as cause_title,
        l.id as leader_id, l.name as leader_name
      FROM products p
      LEFT JOIN entrepreneurs e ON p.entrepreneur_id = e.id
      LEFT JOIN leaders pl ON p.leader_id = pl.id
      JOIN causes c ON p.cause_id = c.id
      JOIN leaders l ON c.leader_id = l.id
      WHERE p.is_active = 1 ${cursorCondition}
    `;
    const params: (string | number)[] = [...cursorParams];

    if (options.department) {
      query += ` AND COALESCE(CASE WHEN p.leader_id IS NOT NULL THEN pl.department ELSE e.department END, '') = ?`;
      params.push(options.department);
    }
    if (options.city) {
      query += ` AND COALESCE(CASE WHEN p.leader_id IS NOT NULL THEN pl.city ELSE e.city END, '') = ?`;
      params.push(options.city);
    }

    query += ` ORDER BY p.created_at DESC, p.id DESC LIMIT ?`;
    params.push(options.limit);

    const { results } = await this.db
      .prepare(query)
      .bind(...params)
      .all<FeedProductRow>();
    return results || [];
  }

  async fetchCauses(options: FeedQueryOptions): Promise<FeedCauseRow[]> {
    const cursorCondition = options.cursor
      ? `AND (c.created_at < ? OR (c.created_at = ? AND c.id < ?))`
      : '';
    const cursorParams = options.cursor
      ? [options.cursor.timestamp, options.cursor.timestamp, options.cursor.id]
      : [];

    let query = `
      SELECT
        c.id, 'cause' as type, c.created_at,
        c.title, c.description, c.photo_url,
        c.target_goal, c.current_amount, c.status,
        l.id as leader_id, l.name as leader_name, l.photo_url as leader_photo,
        l.city as leader_city, l.department as leader_department, l.tags as leader_tags
      FROM causes c
      JOIN leaders l ON c.leader_id = l.id
      WHERE c.status = 'active' ${cursorCondition}
    `;
    const params: (string | number)[] = [...cursorParams];

    if (options.department) {
      query += ` AND l.department = ?`;
      params.push(options.department);
    }
    if (options.city) {
      query += ` AND l.city = ?`;
      params.push(options.city);
    }
    if (options.categories && options.categories.length > 0) {
      const categoryConditions = options.categories.map(() => `l.tags LIKE ?`).join(' OR ');
      query += ` AND (${categoryConditions})`;
      options.categories.forEach((cat) => params.push(`%"${escapeLikePattern(cat)}"%`));
    }

    query += ` ORDER BY c.created_at DESC, c.id DESC LIMIT ?`;
    params.push(options.limit);

    const { results } = await this.db
      .prepare(query)
      .bind(...params)
      .all<FeedCauseRow>();
    return results || [];
  }

  async fetchCauseUpdates(options: FeedQueryOptions): Promise<FeedCauseUpdateRow[]> {
    const cursorCondition = options.cursor
      ? `AND (cu.created_at < ? OR (cu.created_at = ? AND cu.id < ?))`
      : '';
    const cursorParams = options.cursor
      ? [options.cursor.timestamp, options.cursor.timestamp, options.cursor.id]
      : [];

    let query = `
      SELECT
        cu.id, 'cause_update' as type, cu.created_at,
        cu.title, cu.content, cu.photo_url, cu.photos, cu.update_type, cu.is_closing,
        l.id as leader_id, l.name as leader_name, l.photo_url as leader_photo,
        l.city as leader_city, l.department as leader_department,
        c.id as cause_id, c.title as cause_title, c.status as cause_status
      FROM cause_updates cu
      JOIN leaders l ON cu.leader_id = l.id
      JOIN causes c ON cu.cause_id = c.id
      WHERE 1=1 ${cursorCondition}
    `;
    const params: (string | number)[] = [...cursorParams];

    if (options.department) {
      query += ` AND l.department = ?`;
      params.push(options.department);
    }
    if (options.city) {
      query += ` AND l.city = ?`;
      params.push(options.city);
    }

    query += ` ORDER BY cu.created_at DESC, cu.id DESC LIMIT ?`;
    params.push(options.limit);

    const { results } = await this.db
      .prepare(query)
      .bind(...params)
      .all<FeedCauseUpdateRow>();
    return results || [];
  }

  async getDistinctDepartments(): Promise<string[]> {
    const { results: leaderDepts } = await this.db
      .prepare(
        'SELECT DISTINCT department FROM leaders WHERE department IS NOT NULL ORDER BY department',
      )
      .all<{ department: string }>();

    const { results: entrepreneurDepts } = await this.db
      .prepare(
        'SELECT DISTINCT department FROM entrepreneurs WHERE department IS NOT NULL ORDER BY department',
      )
      .all<{ department: string }>();

    const departments = new Set<string>();
    (leaderDepts || []).forEach((r) => departments.add(r.department));
    (entrepreneurDepts || []).forEach((r) => departments.add(r.department));

    return [...departments].sort();
  }
}
