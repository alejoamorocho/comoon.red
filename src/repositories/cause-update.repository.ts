import type { D1Database } from '@cloudflare/workers-types';
import { BaseRepository } from './base.repository';

export interface CauseUpdateRow {
  id: number;
  leader_id: number;
  cause_id: number;
  title: string;
  content: string;
  photo_url: string | null;
  photos: string | null;
  update_type: string;
  is_closing: boolean | number;
  created_at: string;
}

export interface CauseUpdateWithDetails extends CauseUpdateRow {
  leader_name: string;
  leader_photo: string | null;
  leader_city: string | null;
  leader_department: string | null;
  cause_title: string;
  cause_status: string;
}

export interface CauseUpdateWithFullDetails extends CauseUpdateRow {
  leader_name: string;
  leader_photo: string | null;
  leader_bio: string | null;
  leader_city: string | null;
  leader_department: string | null;
  cause_title: string;
  cause_description: string | null;
  target_goal: number | null;
  current_amount: number;
  cause_status: string;
}

export class CauseUpdateRepository extends BaseRepository<CauseUpdateRow> {
  constructor(db: D1Database) {
    super(db, 'cause_updates');
  }

  async findAllWithDetails(options?: {
    leaderId?: string;
    causeId?: string;
    limit?: number;
    offset?: number;
  }): Promise<CauseUpdateWithDetails[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const params: (string | number)[] = [];

    let query = `
      SELECT
        cu.*,
        l.name as leader_name, l.photo_url as leader_photo,
        l.city as leader_city, l.department as leader_department,
        ca.title as cause_title, ca.status as cause_status
      FROM cause_updates cu
      JOIN leaders l ON cu.leader_id = l.id
      JOIN causes ca ON cu.cause_id = ca.id
      WHERE 1=1
    `;

    if (options?.leaderId) {
      query += ` AND cu.leader_id = ?`;
      params.push(options.leaderId);
    }
    if (options?.causeId) {
      query += ` AND cu.cause_id = ?`;
      params.push(options.causeId);
    }

    query += ` ORDER BY cu.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results } = await this.db
      .prepare(query)
      .bind(...params)
      .all<CauseUpdateWithDetails>();
    return results || [];
  }

  async findByIdWithDetails(id: number): Promise<CauseUpdateWithFullDetails | null> {
    return this.db
      .prepare(
        `SELECT
          cu.*,
          l.id as leader_id, l.name as leader_name, l.photo_url as leader_photo,
          l.bio as leader_bio, l.city as leader_city, l.department as leader_department,
          ca.id as cause_id, ca.title as cause_title, ca.description as cause_description,
          ca.target_goal, ca.current_amount, ca.status as cause_status
        FROM cause_updates cu
        JOIN leaders l ON cu.leader_id = l.id
        JOIN causes ca ON cu.cause_id = ca.id
        WHERE cu.id = ?`,
      )
      .bind(id)
      .first<CauseUpdateWithFullDetails>();
  }

  async create(data: {
    leader_id: number;
    cause_id: number;
    title: string;
    content: string;
    photo_url?: string | null;
    photos?: unknown;
    update_type?: string;
    is_closing?: boolean;
  }): Promise<CauseUpdateRow> {
    const result = await this.db
      .prepare(
        `INSERT INTO cause_updates (leader_id, cause_id, title, content, photo_url, photos, update_type, is_closing)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        data.leader_id,
        data.cause_id,
        data.title,
        data.content,
        data.photo_url || null,
        data.photos ? JSON.stringify(data.photos) : null,
        data.update_type || 'progress',
        data.is_closing ? 1 : 0,
      )
      .run();

    const id = result.meta.last_row_id as number;
    return (await this.findById(id))!;
  }

  async update(
    id: number,
    data: Partial<{
      title: string;
      content: string;
      photo_url: string | null;
      photos: unknown;
      update_type: string;
    }>,
  ): Promise<CauseUpdateRow | null> {
    await this.db
      .prepare(
        `UPDATE cause_updates SET
          title = COALESCE(?, title),
          content = COALESCE(?, content),
          photo_url = COALESCE(?, photo_url),
          photos = COALESCE(?, photos),
          update_type = COALESCE(?, update_type)
        WHERE id = ?`,
      )
      .bind(
        data.title || null,
        data.content || null,
        data.photo_url || null,
        data.photos ? JSON.stringify(data.photos) : null,
        data.update_type || null,
        id,
      )
      .run();

    return this.findById(id);
  }

  async findCreatedWithCauseTitle(id: number): Promise<
    | (CauseUpdateRow & {
        cause_title: string;
        cause_status: string;
      })
    | null
  > {
    return this.db
      .prepare(
        `SELECT cu.*, ca.title as cause_title, ca.status as cause_status
         FROM cause_updates cu
         JOIN causes ca ON cu.cause_id = ca.id
         WHERE cu.id = ?`,
      )
      .bind(id)
      .first();
  }
}
