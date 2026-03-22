import type { D1Database } from '@cloudflare/workers-types';

export interface PostRow {
  id: number;
  user_id: number;
  content: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends PostRow {
  author_name: string;
  author_photo: string | null;
  author_role: string;
  author_city: string | null;
  author_department: string | null;
}

export class PostRepository {
  constructor(private db: D1Database) {}

  async findAllWithAuthor(options?: {
    limit?: number;
    offset?: number;
    cursor?: { timestamp: string; id: number } | null;
  }): Promise<PostWithAuthor[]> {
    const limit = options?.limit ?? 20;
    const params: (string | number)[] = [];

    let cursorCondition = '';
    if (options?.cursor) {
      cursorCondition = 'AND (p.created_at < ? OR (p.created_at = ? AND p.id < ?))';
      params.push(options.cursor.timestamp, options.cursor.timestamp, options.cursor.id);
    }

    const query = `
      SELECT
        p.*,
        u.role as author_role,
        CASE
          WHEN u.role = 'leader' THEN l.name
          WHEN u.role = 'entrepreneur' THEN e.store_name
          ELSE u.email
        END as author_name,
        CASE
          WHEN u.role = 'leader' THEN l.photo_url
          WHEN u.role = 'entrepreneur' THEN e.photo_url
          ELSE NULL
        END as author_photo,
        CASE
          WHEN u.role = 'leader' THEN l.city
          WHEN u.role = 'entrepreneur' THEN e.city
          ELSE NULL
        END as author_city,
        CASE
          WHEN u.role = 'leader' THEN l.department
          WHEN u.role = 'entrepreneur' THEN e.department
          ELSE NULL
        END as author_department
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN leaders l ON u.role = 'leader' AND u.profile_id = l.id
      LEFT JOIN entrepreneurs e ON u.role = 'entrepreneur' AND u.profile_id = e.id
      WHERE 1=1 ${cursorCondition}
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT ?
    `;
    params.push(limit);

    const { results } = await this.db
      .prepare(query)
      .bind(...params)
      .all<PostWithAuthor>();
    return results || [];
  }

  async findById(id: number): Promise<PostRow | null> {
    return this.db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first<PostRow>();
  }

  async findByIdWithAuthor(id: number): Promise<PostWithAuthor | null> {
    const query = `
      SELECT
        p.*,
        u.role as author_role,
        CASE
          WHEN u.role = 'leader' THEN l.name
          WHEN u.role = 'entrepreneur' THEN e.store_name
          ELSE u.email
        END as author_name,
        CASE
          WHEN u.role = 'leader' THEN l.photo_url
          WHEN u.role = 'entrepreneur' THEN e.photo_url
          ELSE NULL
        END as author_photo,
        CASE
          WHEN u.role = 'leader' THEN l.city
          WHEN u.role = 'entrepreneur' THEN e.city
          ELSE NULL
        END as author_city,
        CASE
          WHEN u.role = 'leader' THEN l.department
          WHEN u.role = 'entrepreneur' THEN e.department
          ELSE NULL
        END as author_department
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN leaders l ON u.role = 'leader' AND u.profile_id = l.id
      LEFT JOIN entrepreneurs e ON u.role = 'entrepreneur' AND u.profile_id = e.id
      WHERE p.id = ?
    `;
    return this.db.prepare(query).bind(id).first<PostWithAuthor>();
  }

  async findByUserId(userId: number, limit = 20): Promise<PostRow[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
      .bind(userId, limit)
      .all<PostRow>();
    return results || [];
  }

  async create(data: {
    user_id: number;
    content: string;
    photo_url?: string | null;
  }): Promise<PostRow> {
    const result = await this.db
      .prepare('INSERT INTO posts (user_id, content, photo_url) VALUES (?, ?, ?)')
      .bind(data.user_id, data.content, data.photo_url || null)
      .run();

    const id = result.meta.last_row_id as number;
    return (await this.findById(id))!;
  }

  async update(
    id: number,
    data: Partial<{ content: string; photo_url: string | null }>,
  ): Promise<PostRow | null> {
    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }
    if (data.photo_url !== undefined) {
      fields.push('photo_url = ?');
      values.push(data.photo_url);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id as unknown as string);

    await this.db
      .prepare(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  }
}
