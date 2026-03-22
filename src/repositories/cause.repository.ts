import type { D1Database } from '@cloudflare/workers-types';
import { BaseRepository } from './base.repository';

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

export interface CauseWithLeader extends CauseRow {
  leader_name: string;
  leader_photo: string | null;
  leader_city: string | null;
  leader_department: string | null;
  leader_tags: string | null;
}

export class CauseRepository extends BaseRepository<CauseRow> {
  constructor(db: D1Database) {
    super(db, 'causes');
  }

  async findByIdWithLeader(id: number): Promise<CauseWithLeader | null> {
    return this.db
      .prepare(
        `SELECT
          c.*,
          l.name as leader_name, l.photo_url as leader_photo,
          l.city as leader_city, l.department as leader_department, l.tags as leader_tags
        FROM causes c
        JOIN leaders l ON c.leader_id = l.id
        WHERE c.id = ?`,
      )
      .bind(id)
      .first<CauseWithLeader>();
  }

  async findByLeaderId(leaderId: number): Promise<CauseRow[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM causes WHERE leader_id = ?')
      .bind(leaderId)
      .all<CauseRow>();
    return results || [];
  }

  async findByLeaderIdAndId(
    causeId: number,
    leaderId: number,
  ): Promise<{ id: number; status: string } | null> {
    return this.db
      .prepare('SELECT id, status FROM causes WHERE id = ? AND leader_id = ?')
      .bind(causeId, leaderId)
      .first<{ id: number; status: string }>();
  }

  async create(data: {
    leader_id: number;
    title: string;
    description?: string | null;
    target_goal?: number | null;
    photo_url?: string | null;
    evidence_photos?: unknown;
    status?: string;
  }): Promise<CauseRow> {
    const result = await this.db
      .prepare(
        `INSERT INTO causes (leader_id, title, description, target_goal, photo_url, evidence_photos, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        data.leader_id,
        data.title,
        data.description || null,
        data.target_goal || null,
        data.photo_url || null,
        data.evidence_photos ? JSON.stringify(data.evidence_photos) : null,
        data.status || 'active',
      )
      .run();

    const id = result.meta.last_row_id as number;
    return (await this.findById(id))!;
  }

  async update(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      target_goal: number | null;
      photo_url: string | null;
      evidence_photos: unknown;
      status: string;
      admin_notes: string | null;
    }>,
  ): Promise<CauseRow | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.target_goal !== undefined) {
      fields.push('target_goal = ?');
      values.push(data.target_goal);
    }
    if (data.photo_url !== undefined) {
      fields.push('photo_url = ?');
      values.push(data.photo_url);
    }
    if (data.evidence_photos !== undefined) {
      fields.push('evidence_photos = ?');
      values.push(data.evidence_photos ? JSON.stringify(data.evidence_photos) : null);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.admin_notes !== undefined) {
      fields.push('admin_notes = ?');
      values.push(data.admin_notes);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db
      .prepare(`UPDATE causes SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }

  async updateAmount(id: number, amount: number): Promise<void> {
    await this.db
      .prepare('UPDATE causes SET current_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(amount, id)
      .run();
  }

  async updateStatus(id: number, status: string): Promise<void> {
    await this.db
      .prepare('UPDATE causes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(status, id)
      .run();
  }

  async findAllFiltered(options: {
    conditions: string[];
    values: (string | number)[];
    limit: number;
    offset: number;
  }): Promise<CauseWithLeader[]> {
    let query = `
      SELECT c.*,
        l.name as leader_name, l.photo_url as leader_photo,
        l.city as leader_city, l.department as leader_department, l.tags as leader_tags
      FROM causes c
      JOIN leaders l ON c.leader_id = l.id
    `;

    if (options.conditions.length > 0) {
      query += ` WHERE ${options.conditions.join(' AND ')}`;
    }

    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    const params = [...options.values, options.limit, options.offset];

    const { results } = await this.db
      .prepare(query)
      .bind(...params)
      .all<CauseWithLeader>();
    return results || [];
  }
}
